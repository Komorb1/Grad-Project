-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('active', 'disabled');

-- CreateEnum
CREATE TYPE "SiteStatus" AS ENUM ('active', 'inactive');

-- CreateEnum
CREATE TYPE "SiteUserRole" AS ENUM ('owner', 'admin', 'viewer');

-- CreateEnum
CREATE TYPE "DeviceStatus" AS ENUM ('online', 'offline', 'maintenance');

-- CreateEnum
CREATE TYPE "SensorType" AS ENUM ('gas', 'smoke', 'flame', 'motion', 'door', 'temp', 'other');

-- CreateEnum
CREATE TYPE "SensorStatus" AS ENUM ('ok', 'faulty', 'disabled');

-- CreateEnum
CREATE TYPE "ReadingQualityFlag" AS ENUM ('ok', 'suspect');

-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('gas', 'smoke', 'flame', 'intrusion', 'device_offline', 'tamper', 'other');

-- CreateEnum
CREATE TYPE "Severity" AS ENUM ('low', 'medium', 'high', 'critical');

-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('new', 'acknowledged', 'resolved', 'false_alarm');

-- CreateEnum
CREATE TYPE "AlertChannel" AS ENUM ('web_push', 'email', 'sms');

-- CreateEnum
CREATE TYPE "AlertStatus" AS ENUM ('queued', 'sent', 'delivered', 'failed');

-- CreateEnum
CREATE TYPE "AuditActionType" AS ENUM ('create_event', 'ack', 'resolve', 'login', 'update_settings', 'other');

-- CreateEnum
CREATE TYPE "AuditTargetType" AS ENUM ('site', 'device', 'sensor', 'event', 'subscription', 'other');

-- CreateTable
CREATE TABLE "User" (
    "user_id" UUID NOT NULL,
    "full_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "password_hash" TEXT NOT NULL,
    "status" "UserStatus" NOT NULL DEFAULT 'active',
    "last_login_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "Site" (
    "site_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "address_line" TEXT,
    "city" TEXT,
    "country" TEXT,
    "status" "SiteStatus" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Site_pkey" PRIMARY KEY ("site_id")
);

-- CreateTable
CREATE TABLE "SiteUser" (
    "site_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "role" "SiteUserRole" NOT NULL DEFAULT 'viewer',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SiteUser_pkey" PRIMARY KEY ("site_id","user_id")
);

-- CreateTable
CREATE TABLE "Device" (
    "device_id" UUID NOT NULL,
    "site_id" UUID NOT NULL,
    "serial_number" TEXT NOT NULL,
    "device_type" TEXT NOT NULL,
    "secret_hash" TEXT NOT NULL,
    "installed_at" TIMESTAMPTZ(6),
    "last_seen_at" TIMESTAMPTZ(6),
    "status" "DeviceStatus" NOT NULL DEFAULT 'offline',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Device_pkey" PRIMARY KEY ("device_id")
);

-- CreateTable
CREATE TABLE "Sensor" (
    "sensor_id" UUID NOT NULL,
    "device_id" UUID NOT NULL,
    "sensor_type" "SensorType" NOT NULL,
    "location_label" TEXT,
    "is_enabled" BOOLEAN NOT NULL DEFAULT true,
    "status" "SensorStatus" NOT NULL DEFAULT 'ok',
    "installed_at" TIMESTAMPTZ(6),

    CONSTRAINT "Sensor_pkey" PRIMARY KEY ("sensor_id")
);

-- CreateTable
CREATE TABLE "SensorReading" (
    "reading_id" UUID NOT NULL,
    "sensor_id" UUID NOT NULL,
    "value" DECIMAL(18,6) NOT NULL,
    "unit" TEXT,
    "recorded_at" TIMESTAMPTZ(6),
    "received_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "quality_flag" "ReadingQualityFlag" NOT NULL DEFAULT 'ok',
    "event_id" UUID,

    CONSTRAINT "SensorReading_pkey" PRIMARY KEY ("reading_id")
);

-- CreateTable
CREATE TABLE "EmergencyEvent" (
    "event_id" UUID NOT NULL,
    "site_id" UUID NOT NULL,
    "device_id" UUID,
    "sensor_id" UUID,
    "event_type" "EventType" NOT NULL,
    "severity" "Severity" NOT NULL,
    "status" "EventStatus" NOT NULL DEFAULT 'new',
    "title" TEXT,
    "description" TEXT,
    "started_at" TIMESTAMPTZ(6) NOT NULL,
    "acknowledged_at" TIMESTAMPTZ(6),
    "resolved_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmergencyEvent_pkey" PRIMARY KEY ("event_id")
);

-- CreateTable
CREATE TABLE "AlertNotification" (
    "alert_id" UUID NOT NULL,
    "event_id" UUID NOT NULL,
    "recipient_user_id" UUID NOT NULL,
    "channel" "AlertChannel" NOT NULL DEFAULT 'web_push',
    "status" "AlertStatus" NOT NULL DEFAULT 'queued',
    "sent_at" TIMESTAMPTZ(6),
    "delivered_at" TIMESTAMPTZ(6),
    "error_message" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AlertNotification_pkey" PRIMARY KEY ("alert_id")
);

-- CreateTable
CREATE TABLE "PushSubscription" (
    "subscription_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "endpoint" TEXT NOT NULL,
    "p256dh_key" TEXT NOT NULL,
    "auth_key" TEXT NOT NULL,
    "user_agent" TEXT,
    "device_label" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revoked_at" TIMESTAMPTZ(6),

    CONSTRAINT "PushSubscription_pkey" PRIMARY KEY ("subscription_id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "log_id" UUID NOT NULL,
    "user_id" UUID,
    "event_id" UUID,
    "action_type" "AuditActionType" NOT NULL,
    "target_type" "AuditTargetType" NOT NULL,
    "target_id" TEXT,
    "details" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("log_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_status_idx" ON "User"("status");

-- CreateIndex
CREATE INDEX "Site_status_idx" ON "Site"("status");

-- CreateIndex
CREATE INDEX "SiteUser_user_id_idx" ON "SiteUser"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "Device_serial_number_key" ON "Device"("serial_number");

-- CreateIndex
CREATE INDEX "Device_site_id_idx" ON "Device"("site_id");

-- CreateIndex
CREATE INDEX "Device_status_idx" ON "Device"("status");

-- CreateIndex
CREATE INDEX "Device_last_seen_at_idx" ON "Device"("last_seen_at");

-- CreateIndex
CREATE INDEX "Sensor_device_id_idx" ON "Sensor"("device_id");

-- CreateIndex
CREATE INDEX "Sensor_sensor_type_idx" ON "Sensor"("sensor_type");

-- CreateIndex
CREATE INDEX "Sensor_status_idx" ON "Sensor"("status");

-- CreateIndex
CREATE INDEX "SensorReading_sensor_id_received_at_idx" ON "SensorReading"("sensor_id", "received_at");

-- CreateIndex
CREATE INDEX "SensorReading_event_id_idx" ON "SensorReading"("event_id");

-- CreateIndex
CREATE INDEX "EmergencyEvent_site_id_started_at_idx" ON "EmergencyEvent"("site_id", "started_at");

-- CreateIndex
CREATE INDEX "EmergencyEvent_device_id_idx" ON "EmergencyEvent"("device_id");

-- CreateIndex
CREATE INDEX "EmergencyEvent_sensor_id_idx" ON "EmergencyEvent"("sensor_id");

-- CreateIndex
CREATE INDEX "EmergencyEvent_status_idx" ON "EmergencyEvent"("status");

-- CreateIndex
CREATE INDEX "EmergencyEvent_severity_idx" ON "EmergencyEvent"("severity");

-- CreateIndex
CREATE INDEX "AlertNotification_event_id_idx" ON "AlertNotification"("event_id");

-- CreateIndex
CREATE INDEX "AlertNotification_recipient_user_id_status_idx" ON "AlertNotification"("recipient_user_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "PushSubscription_endpoint_key" ON "PushSubscription"("endpoint");

-- CreateIndex
CREATE INDEX "PushSubscription_user_id_is_active_idx" ON "PushSubscription"("user_id", "is_active");

-- CreateIndex
CREATE INDEX "AuditLog_user_id_created_at_idx" ON "AuditLog"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "AuditLog_event_id_created_at_idx" ON "AuditLog"("event_id", "created_at");

-- CreateIndex
CREATE INDEX "AuditLog_action_type_idx" ON "AuditLog"("action_type");

-- AddForeignKey
ALTER TABLE "SiteUser" ADD CONSTRAINT "SiteUser_site_id_fkey" FOREIGN KEY ("site_id") REFERENCES "Site"("site_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SiteUser" ADD CONSTRAINT "SiteUser_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Device" ADD CONSTRAINT "Device_site_id_fkey" FOREIGN KEY ("site_id") REFERENCES "Site"("site_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sensor" ADD CONSTRAINT "Sensor_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "Device"("device_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SensorReading" ADD CONSTRAINT "SensorReading_sensor_id_fkey" FOREIGN KEY ("sensor_id") REFERENCES "Sensor"("sensor_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SensorReading" ADD CONSTRAINT "SensorReading_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "EmergencyEvent"("event_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmergencyEvent" ADD CONSTRAINT "EmergencyEvent_site_id_fkey" FOREIGN KEY ("site_id") REFERENCES "Site"("site_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmergencyEvent" ADD CONSTRAINT "EmergencyEvent_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "Device"("device_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmergencyEvent" ADD CONSTRAINT "EmergencyEvent_sensor_id_fkey" FOREIGN KEY ("sensor_id") REFERENCES "Sensor"("sensor_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlertNotification" ADD CONSTRAINT "AlertNotification_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "EmergencyEvent"("event_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlertNotification" ADD CONSTRAINT "AlertNotification_recipient_user_id_fkey" FOREIGN KEY ("recipient_user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PushSubscription" ADD CONSTRAINT "PushSubscription_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "EmergencyEvent"("event_id") ON DELETE SET NULL ON UPDATE CASCADE;


ALTER TABLE "EmergencyEvent"
ADD CONSTRAINT "EmergencyEvent_device_or_sensor_required"
CHECK ("device_id" IS NOT NULL OR "sensor_id" IS NOT NULL);
