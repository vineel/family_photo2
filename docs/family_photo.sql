SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='TRADITIONAL,ALLOW_INVALID_DATES';

DROP SCHEMA IF EXISTS `family_photo` ;
CREATE SCHEMA IF NOT EXISTS `family_photo` DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci ;
USE `family_photo` ;

-- -----------------------------------------------------
-- Table `family`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `family` ;

CREATE TABLE IF NOT EXISTS `family` (
  `family_id` INT NOT NULL AUTO_INCREMENT COMMENT '	',
  `family_extid` VARCHAR(2000) NULL,
  `display_name` VARCHAR(2000) NULL COMMENT '			',
  PRIMARY KEY (`family_id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `account`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `account` ;

CREATE TABLE IF NOT EXISTS `account` (
  `account_id` INT NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(2000) NULL COMMENT '	',
  `first_name` VARCHAR(45) NULL COMMENT '					',
  `middle_name` VARCHAR(45) NULL,
  `last_name` VARCHAR(45) NULL,
  `nickname` VARCHAR(45) NULL,
  `created_at` TIMESTAMP NULL,
  `updated_at` TIMESTAMP NULL,
  `login_at` DATETIME NULL,
  `family_id` INT NULL,
  PRIMARY KEY (`account_id`),
  CONSTRAINT `fk_account_family1`
    FOREIGN KEY (`family_id`)
    REFERENCES `family` (`family_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

CREATE INDEX `fk_account_family1_idx` ON `account` (`family_id` ASC);


-- -----------------------------------------------------
-- Table `family_has_family`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `family_has_family` ;

CREATE TABLE IF NOT EXISTS `family_has_family` (
  `src_family_id` INT NOT NULL COMMENT '		',
  `dst_family_id` INT NOT NULL COMMENT '		',
  `relation_type` CHAR(10) NULL,
  PRIMARY KEY (`src_family_id`, `dst_family_id`),
  CONSTRAINT `fk_family_has_family_family1`
    FOREIGN KEY (`src_family_id`)
    REFERENCES `family` (`family_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_family_has_family_family2`
    FOREIGN KEY (`dst_family_id`)
    REFERENCES `family` (`family_id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

CREATE INDEX `fk_family_has_family_family2_idx` ON `family_has_family` (`dst_family_id` ASC);

CREATE INDEX `fk_family_has_family_family1_idx` ON `family_has_family` (`src_family_id` ASC);


-- -----------------------------------------------------
-- Table `asset`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `asset` ;

CREATE TABLE IF NOT EXISTS `asset` (
  `asset_id` INT NOT NULL AUTO_INCREMENT COMMENT '	',
  `asset_type` CHAR(20) NULL COMMENT '	',
  `title` VARCHAR(20) NULL,
  `url` VARCHAR(2000) NULL,
  `size1_url` VARCHAR(2000) NULL COMMENT '			',
  `size2_url` VARCHAR(2000) NULL,
  `uploader_account_id` INT NULL COMMENT '	',
  `family_id` INT NULL,
  `pipeline_stage` VARCHAR(45) NULL,
  `created_at` TIMESTAMP NULL,
  `uploaded_at` TIMESTAMP NULL,
  `width` INT NULL,
  `height` INT NULL,
  `full_size_meta` VARCHAR(45) NULL,
  PRIMARY KEY (`asset_id`))
ENGINE = InnoDB;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
