#!/bin/bash
mysql -h 127.0.0.1 -P 3307 -u root -pshiyuq --default-character-set=utf8mb4 know_your_quotation < migration/mysql/all_tables_data.sql