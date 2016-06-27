export MYSQL_DB=family_photo

mysql --defaults-file=my.cnf -D family_photo < family_photo.sql

mysql --defaults-file=my.cnf -D family_photo < initialize.sql








