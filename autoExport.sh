#!/bin/bash
mkdir -p migration/mysql
mysqldump -h 127.0.0.1 -P 3307 -u root -pshiyuq --default-character-set=utf8mb4 know_your_quotation customer product quotation sku tenant user image > migration/mysql/all_tables_data.sql
