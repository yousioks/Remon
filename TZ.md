

2) Ошибка в базе данных опять. При создании любого другого юзера выскакивает ошибка. Так ещё и не войти в админку 

C:\Users\omskp\OneDrive\Рабочий стол\Диплом\Remon\init.sql

2026-05-11 06:29:32.586 UTC [26] LOG:  checkpoint complete: wrote 3 buffers (0.0%); 0 WAL file(s) added, 0 removed, 0 recycled; write=0.006 s, sync=0.003 s, total=0.016 s; sync files=2, longest=0.002 s, average=0.002 s; distance=0 kB, estimate=0 kB
2026-05-11 06:48:54.658 UTC [2082] FATAL:  password authentication failed for user "remon_user"
2026-05-11 06:48:54.658 UTC [2082] DETAIL:  Connection matched pg_hba.conf line 100: "host all all all scram-sha-256"
root@VM-623424:/var/www/remon#

root@VM-623424:/var/www/remon# docker logs remon-db-1

PostgreSQL Database directory appears to contain a database; Skipping initialization

2026-05-11 06:24:32.464 UTC [1] LOG:  starting PostgreSQL 15.17 on x86_64-pc-linux-musl, compiled by gcc (Alpine 15.2.0) 15.2.0, 64-bit
2026-05-11 06:24:32.465 UTC [1] LOG:  listening on IPv4 address "0.0.0.0", port 5432
2026-05-11 06:24:32.465 UTC [1] LOG:  listening on IPv6 address "::", port 5432
2026-05-11 06:24:32.469 UTC [1] LOG:  listening on Unix socket "/var/run/postgresql/.s.PGSQL.5432"
2026-05-11 06:24:32.477 UTC [28] LOG:  database system was shut down at 2026-05-11 06:23:16 UTC
2026-05-11 06:24:32.489 UTC [1] LOG:  database system is ready to accept connections
2026-05-11 06:25:46.284 UTC [131] FATAL:  password authentication failed for user "remon_user"
2026-05-11 06:25:46.284 UTC [131] DETAIL:  Connection matched pg_hba.conf line 100: "host all all all scram-sha-256"
2026-05-11 06:25:46.544 UTC [132] FATAL:  password authentication failed for user "remon_user"
2026-05-11 06:25:46.544 UTC [132] DETAIL:  Connection matched pg_hba.conf line 100: "host all all all scram-sha-256"
2026-05-11 06:26:11.115 UTC [168] FATAL:  password authentication failed for user "remon_user"
2026-05-11 06:26:11.115 UTC [168] DETAIL:  Connection matched pg_hba.conf line 100: "host all all all scram-sha-256"
2026-05-11 06:26:21.244 UTC [183] FATAL:  password authentication failed for user "remon_user"
2026-05-11 06:26:21.244 UTC [183] DETAIL:  Connection matched pg_hba.conf line 100: "host all all all scram-sha-256"
2026-05-11 06:26:23.282 UTC [184] FATAL:  password authentication failed for user "remon_user"
2026-05-11 06:26:23.282 UTC [184] DETAIL:  Connection matched pg_hba.conf line 100: "host all all all scram-sha-256"


