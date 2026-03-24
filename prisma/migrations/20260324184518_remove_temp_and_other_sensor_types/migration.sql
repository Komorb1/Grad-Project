/*
  Warnings:

  - The values [temp,other] on the enum `SensorType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "SensorType_new" AS ENUM ('gas', 'smoke', 'flame', 'motion', 'door');
ALTER TABLE "Sensor" ALTER COLUMN "sensor_type" TYPE "SensorType_new" USING ("sensor_type"::text::"SensorType_new");
ALTER TYPE "SensorType" RENAME TO "SensorType_old";
ALTER TYPE "SensorType_new" RENAME TO "SensorType";
DROP TYPE "public"."SensorType_old";
COMMIT;
