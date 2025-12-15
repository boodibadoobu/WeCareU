-- AlterTable
ALTER TABLE `anonchatsession` ADD COLUMN `student_id` INTEGER NULL;

-- AlterTable
ALTER TABLE `article` ADD COLUMN `category` VARCHAR(191) NOT NULL DEFAULT 'General',
    ADD COLUMN `thumbnail_url` VARCHAR(191) NULL;
