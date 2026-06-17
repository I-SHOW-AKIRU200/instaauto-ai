#!/usr/bin/env bash
set -euo pipefail

# ─── Colors ───
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${BLUE}"
echo "╔═══════════════════════════════════════════════╗"
echo "║        InstaAuto AI — Deployment Setup        ║"
echo "╚═══════════════════════════════════════════════╝"
echo -e "${NC}"

# ─── Prerequisites ───
echo -e "${YELLOW}[1/7] Checking prerequisites...${NC}"

command -v node >/dev/null 2>&1 || { echo -e "${RED}✗ Node.js is required${NC}"; exit 1; }
command -v npm >/dev/null 2>&1  || { echo -e "${RED}✗ npm is required${NC}"; exit 1; }
command -v npx >/dev/null 2>&1  || { echo -e "${RED}✗ npx is required${NC}"; exit 1; }

NODE_VER=$(node -v | sed 's/v//' | cut -d. -f1)
if [ "$NODE_VER" -lt 18 ]; then
  echo -e "${RED}✗ Node.js >= 18 required (found v$(node -v))${NC}"
  exit 1
fi
echo -e "${GREEN}✓${NC} Node.js $(node -v), npm $(npm -v)"

# ─── .env check ───
if [ ! -f .env ]; then
  echo -e "${RED}✗ .env file not found${NC}"
  echo "  Copy .env.example to .env and fill in all values first."
  exit 1
fi
echo -e "${GREEN}✓${NC} .env found"

# ─── Timezone ───
echo ""
echo -e "${YELLOW}[2/7] Timezone Configuration${NC}"
echo "  Enter your UTC offset so posts go live at your local time."
echo ""
echo "  Common offsets:"
echo "    UTC-12 to UTC-2  → Americas / Pacific"
echo "    UTC+0            → UK / Ireland / Portugal"
echo "    UTC+1 to UTC+3   → Europe / Africa / Middle East"
echo "    UTC+3 to UTC+5   → East Africa / Middle East / India"
echo "    UTC+5 to UTC+8   → Central / Southeast Asia"
echo "    UTC+8 to UTC+12  → East Asia / Australia / Pacific"
echo ""
read -p "  Enter your UTC offset (e.g., 1, -5, 3): " TZ_OFFSET

if ! [[ "$TZ_OFFSET" =~ ^-?[0-9]+$ ]]; then
  echo -e "${RED}  ✗ Invalid offset. Must be a whole number like 1, -5, or 3.${NC}"
  exit 1
fi
if [ "$TZ_OFFSET" -lt -12 ] || [ "$TZ_OFFSET" -gt 14 ]; then
  echo -e "${RED}  ✗ Offset must be between -12 and +14.${NC}"
  exit 1
fi

TZ_LABEL="UTC${TZ_OFFSET}"
if [ "$TZ_OFFSET" -ge 0 ]; then
  TZ_LABEL="UTC+${TZ_OFFSET}"
fi

echo -e "${GREEN}  ✓${NC} Timezone set to ${TZ_LABEL}"

# ─── Posting Hour ───
echo ""
echo -e "${YELLOW}[3/7] Posting Schedule${NC}"
read -p "  At what hour (0-23, local time) should the daily post go live? " LOCAL_HOUR

if ! [[ "$LOCAL_HOUR" =~ ^[0-9]+$ ]] || [ "$LOCAL_HOUR" -lt 0 ] || [ "$LOCAL_HOUR" -gt 23 ]; then
  echo -e "${RED}  ✗ Invalid hour. Must be 0-23.${NC}"
  exit 1
fi

UTC_HOUR=$(( (LOCAL_HOUR - TZ_OFFSET) % 24 ))
if [ "$UTC_HOUR" -lt 0 ]; then
  UTC_HOUR=$(( UTC_HOUR + 24 ))
fi

echo -e "${GREEN}  ✓${NC} Posting at ${LOCAL_HOUR}:00 ${TZ_LABEL} → UTC ${UTC_HOUR}:00"

# ─── Install & Build ───
echo ""
echo -e "${YELLOW}[4/7] Installing dependencies...${NC}"
npm install
echo -e "${GREEN}  ✓${NC} Dependencies installed"

echo ""
echo -e "${YELLOW}[5/7] Building application...${NC}"
npm run build
echo -e "${GREEN}  ✓${NC} Build complete"

# ─── Push Schema & Update Config ───
echo ""
echo -e "${YELLOW}[6/7] Updating database...${NC}"

echo "  → Pushing schema..."
npx prisma db push --accept-data-loss 2>/dev/null
echo -e "${GREEN}  ✓${NC} Schema pushed"

echo "  → Setting timezoneOffset=${TZ_OFFSET} and scheduleHour=${LOCAL_HOUR}..."
npx tsx -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const config = await prisma.instagramConfig.findFirst();
  if (config) {
    await prisma.instagramConfig.update({
      where: { id: config.id },
      data: { timezoneOffset: ${TZ_OFFSET}, scheduleHour: ${LOCAL_HOUR} },
    });
    console.log('    ✔ Updated: timezoneOffset=' + ${TZ_OFFSET} + ', scheduleHour=' + ${LOCAL_HOUR});
  } else {
    console.log('    ! No config found — run \"npm run seed\" first.');
    process.exit(1);
  }
}
main().finally(() => prisma.\$disconnect());
" 2>/dev/null

echo -e "${GREEN}  ✓${NC} Database configured"

# ─── Systemd Service ───
echo ""
echo -e "${YELLOW}[7/7] Setting up systemd service...${NC}"

SERVICE_NAME="instauto-ai"
SERVICE_FILE="/etc/systemd/system/${SERVICE_NAME}.service"
ROOT_USER=$(whoami)
ROOT_DIR=$(pwd)
NPM_BIN=$(which npm)

sudo tee "$SERVICE_FILE" > /dev/null << SERVICEEOF
[Unit]
Description=InstaAuto AI — Instagram Automation
After=network.target
StartLimitIntervalSec=0

[Service]
Type=simple
User=${ROOT_USER}
WorkingDirectory=${ROOT_DIR}
ExecStart=${NPM_BIN} start -- -p 3000
Restart=always
RestartSec=10
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
SERVICEEOF

sudo systemctl daemon-reload
sudo systemctl enable "${SERVICE_NAME}"
sudo systemctl restart "${SERVICE_NAME}"
echo -e "${GREEN}  ✓${NC} Service ${SERVICE_NAME} created and started"

# ─── Crontab ───
CRON_SECRET_VAL=$(grep "^CRON_SECRET=" .env | cut -d'=' -f2- | tr -d '"')
if [ -z "$CRON_SECRET_VAL" ]; then
  echo -e "${YELLOW}  ⚠ CRON_SECRET not found in .env.${NC}"
  echo "  You'll need to add the cron job manually:"
  echo "    0 ${UTC_HOUR} * * * curl -s -X POST http://localhost:3000/api/cron/worker -H \"Authorization: Bearer YOUR_SECRET\" -H \"Content-Type: application/json\""
else
  CRON_MIN=$(( RANDOM % 30 ))
  CRON_LINE="${CRON_MIN} ${UTC_HOUR} * * * curl -s -X POST http://localhost:3000/api/cron/worker -H \"Authorization: Bearer ${CRON_SECRET_VAL}\" -H \"Content-Type: application/json\""
  (crontab -l 2>/dev/null | grep -v "api/cron/worker" || true; echo "$CRON_LINE") | crontab -
  echo -e "${GREEN}  ✓${NC} Daily cron job added (${CRON_MIN} ${UTC_HOUR} * * *)"
fi

# ─── Summary ───
echo ""
echo -e "${BLUE}╔═══════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║           Deployment Complete! 🚀              ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════╝${NC}"
echo ""
echo -e "  ${GREEN}➜${NC} Dashboard:    ${CYAN}http://localhost:3000/dashboard${NC}"
echo -e "  ${GREEN}➜${NC} Post time:    ${CYAN}${LOCAL_HOUR}:00${NC} ${TZ_LABEL}"
echo -e "  ${GREEN}➜${NC} UTC time:     ${CYAN}${UTC_HOUR}:00${NC}"
echo -e "  ${GREEN}➜${NC} Timezone:     ${CYAN}${TZ_LABEL}${NC}"
echo ""
echo -e "  Service management:"
echo -e "    ${GREEN}sudo systemctl status ${SERVICE_NAME}${NC}"
echo -e "    ${GREEN}sudo journalctl -u ${SERVICE_NAME} -f${NC}"
echo -e "    ${GREEN}sudo systemctl restart ${SERVICE_NAME}${NC}"
echo ""
echo -e "  Trigger pipeline manually:"
echo -e "    ${GREEN}curl -X POST http://localhost:3000/api/cron/worker \\${NC}"
echo -e "      ${GREEN}-H \"Authorization: Bearer ${CRON_SECRET_VAL}\" \\${NC}"
echo -e "      ${GREEN}-H \"Content-Type: application/json\"${NC}"
echo ""
