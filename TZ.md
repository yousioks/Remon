Из-за многочисленных ошибок я чуть не помер. После того как ты отключился я использовал другие модели. Они могли наделать херни. Трогали layout.tsx, page.tsx, Header.tsx так как я понял в чём проблема. Когда заходишь на главную страницу - шапка одного размера, разрезана на две части. Когда скролишь она другого размера становится. Пусть шапка будет размера сразу как при скроле, чтобы не разрезало на две части белую которая она должна быть и черную которая не должна быть. 
НА ДРУГИХ СТРАНИЦАХ - ВСЁ ЗАЕБИСЬ - МОЖЕШЬ ОТТУДА ВЗЯТЬ.

C:\Users\omskp\OneDrive\Рабочий стол\Диплом\Remon\frontend\src\components\Header.tsx
C:\Users\omskp\OneDrive\Рабочий стол\Диплом\Remon\frontend\src\app\page.tsx

Кроме того есть ошибка инициализации базы данных. root@VM-623424:/var/www/remon# docker logs d83319430d06
Если сможешь сделай нормальную бд.
/usr/local/bin/docker-entrypoint.sh: running /docker-entrypoint-initdb.d/init.sql
DO
GRANT
ALTER DATABASE
psql:/docker-entrypoint-initdb.d/init.sql:31: ERROR:  syntax error at or near "id"
LINE 1: id SERIAL PRIMARY KEY,
        ^
2026-05-10 16:43:38.384 UTC [54] ERROR:  syntax error at or near "id" at character 1
2026-05-10 16:43:38.384 UTC [54] STATEMENT:  id SERIAL PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255),
          full_name VARCHAR(255),
          phone VARCHAR(50),
          role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
          status VARCHAR(30) DEFAULT 'none' CHECK (status IN ('none', 'user', 'resident_premium', 'resident_business')),
          avatar_url TEXT,
          auth_provider VARCHAR(20) DEFAULT 'local',
          provider_id VARCHAR(255),
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );

PostgreSQL Database directory appears to contain a database; Skipping initialization

2026-05-10 16:43:38.866 UTC [1] LOG:  starting PostgreSQL 15.17 on x86_64-pc-linux-musl, compiled by gcc (Alpine 15.2.0) 15.2.0, 64-bit
2026-05-10 16:43:38.866 UTC [1] LOG:  listening on IPv4 address "0.0.0.0", port 5432
2026-05-10 16:43:38.866 UTC [1] LOG:  listening on IPv6 address "::", port 5432
2026-05-10 16:43:38.870 UTC [1] LOG:  listening on Unix socket "/var/run/postgresql/.s.PGSQL.5432"
2026-05-10 16:43:38.875 UTC [29] LOG:  database system was interrupted; last known up at 2026-05-10 16:43:38 UTC
2026-05-10 16:43:39.002 UTC [29] LOG:  database system was not properly shut down; automatic recovery in progress
2026-05-10 16:43:39.006 UTC [29] LOG:  redo starts at 0/1509928
2026-05-10 16:43:39.045 UTC [29] LOG:  invalid record length at 0/192D578: wanted 24, got 0
2026-05-10 16:43:39.045 UTC [29] LOG:  redo done at 0/192D530 system usage: CPU: user: 0.00 s, system: 0.02 s, elapsed: 0.03 s
2026-05-10 16:43:39.051 UTC [27] LOG:  checkpoint starting: end-of-recovery immediate wait
2026-05-10 16:43:39.127 UTC [27] LOG:  checkpoint complete: wrote 921 buffers (5.6%); 0 WAL file(s) added, 0 removed, 0 recycled; write=0.037 s, sync=0.034 s, total=0.078 s; sync files=301, longest=0.003 s, average=0.001 s; distance=4239 kB, estimate=4239 kB
2026-05-10 16:43:39.133 UTC [1] LOG:  database system is ready to accept connections
2026-05-10 16:44:00.957 UTC [61] ERROR:  relation "users" does not exist at character 15
2026-05-10 16:44:00.957 UTC [61] STATEMENT:  SELECT * FROM users WHERE email = $1
2026-05-10 16:44:01.880 UTC [62] ERROR:  relation "users" does not exist at character 15
2026-05-10 16:44:01.880 UTC [62] STATEMENT:  SELECT * FROM users WHERE email = $1
2026-05-10 16:44:02.336 UTC [63] ERROR:  relation "users" does not exist at character 15
2026-05-10 16:44:02.336 UTC [63] STATEMENT:  SELECT * FROM users WHERE email = $1
2026-05-10 16:44:02.622 UTC [64] ERROR:  relation "users" does not exist at character 15
2026-05-10 16:44:02.622 UTC [64] STATEMENT:  SELECT * FROM users WHERE email = $1
2026-05-10 16:44:02.899 UTC [65] ERROR:  relation "users" does not exist at character 15
2026-05-10 16:44:02.899 UTC [65] STATEMENT:  SELECT * FROM users WHERE email = $1
2026-05-10 16:56:26.974 UTC [1107] ERROR:  relation "users" does not exist at character 16
2026-05-10 16:56:26.974 UTC [1107] STATEMENT:  SELECT id FROM users WHERE email = $1
2026-05-10 17:06:40.248 UTC [1964] ERROR:  relation "apartments" does not exist at character 84
2026-05-10 17:06:40.248 UTC [1964] STATEMENT:
            SELECT a.*, p.name as project_name, p.city, p.class as project_class
            FROM apartments a
            JOIN projects p ON a.project_id = p.id
            WHERE a.is_active = true
           AND a.price <= $1 ORDER BY a.price ASC
2026-05-10 17:06:40.361 UTC [1966] ERROR:  relation "apartments" does not exist at character 84
2026-05-10 17:06:40.361 UTC [1966] STATEMENT:
            SELECT a.*, p.name as project_name, p.city, p.class as project_class
            FROM apartments a
            JOIN projects p ON a.project_id = p.id
            WHERE a.is_active = true
           AND a.price <= $1 ORDER BY a.price ASC
2026-05-10 17:13:46.016 UTC [2564] ERROR:  relation "apartments" does not exist at character 84
2026-05-10 17:13:46.016 UTC [2564] STATEMENT:
            SELECT a.*, p.name as project_name, p.city, p.class as project_class
            FROM apartments a
            JOIN projects p ON a.project_id = p.id
            WHERE a.is_active = true
           AND a.price <= $1 ORDER BY a.price ASC
2026-05-10 17:13:46.129 UTC [2565] ERROR:  relation "apartments" does not exist at character 84
2026-05-10 17:13:46.129 UTC [2565] STATEMENT:
            SELECT a.*, p.name as project_name, p.city, p.class as project_class
            FROM apartments a
            JOIN projects p ON a.project_id = p.id
            WHERE a.is_active = true
           AND a.price <= $1 ORDER BY a.price ASC
2026-05-10 17:13:49.176 UTC [2573] ERROR:  relation "apartments" does not exist at character 84
2026-05-10 17:13:49.176 UTC [2573] STATEMENT:
            SELECT a.*, p.name as project_name, p.city, p.class as project_class
            FROM apartments a
            JOIN projects p ON a.project_id = p.id
            WHERE a.is_active = true
           AND a.price <= $1 ORDER BY a.price ASC
2026-05-10 17:13:49.270 UTC [2574] ERROR:  relation "apartments" does not exist at character 84
2026-05-10 17:13:49.270 UTC [2574] STATEMENT:
            SELECT a.*, p.name as project_name, p.city, p.class as project_class
            FROM apartments a
            JOIN projects p ON a.project_id = p.id
            WHERE a.is_active = true
           AND a.price <= $1 ORDER BY a.price ASC
2026-05-10 17:13:51.175 UTC [2575] ERROR:  relation "apartments" does not exist at character 84
2026-05-10 17:13:51.175 UTC [2575] STATEMENT:
            SELECT a.*, p.name as project_name, p.city, p.class as project_class
            FROM apartments a
            JOIN projects p ON a.project_id = p.id
            WHERE a.is_active = true
           AND a.price <= $1 ORDER BY a.price ASC
2026-05-10 17:13:51.269 UTC [2576] ERROR:  relation "apartments" does not exist at character 84
2026-05-10 17:13:51.269 UTC [2576] STATEMENT:
            SELECT a.*, p.name as project_name, p.city, p.class as project_class
            FROM apartments a
            JOIN projects p ON a.project_id = p.id
            WHERE a.is_active = true
           AND a.price <= $1 ORDER BY a.price ASC
2026-05-10 17:21:50.263 UTC [3249] ERROR:  relation "apartments" does not exist at character 84
2026-05-10 17:21:50.263 UTC [3249] STATEMENT:
            SELECT a.*, p.name as project_name, p.city, p.class as project_class
            FROM apartments a
            JOIN projects p ON a.project_id = p.id
            WHERE a.is_active = true
           AND a.price <= $1 ORDER BY a.price ASC
2026-05-10 17:21:50.378 UTC [3250] ERROR:  relation "apartments" does not exist at character 84
2026-05-10 17:21:50.378 UTC [3250] STATEMENT:
            SELECT a.*, p.name as project_name, p.city, p.class as project_class
            FROM apartments a
            JOIN projects p ON a.project_id = p.id
            WHERE a.is_active = true
           AND a.price <= $1 ORDER BY a.price ASC
2026-05-11 05:09:23.804 UTC [62090] ERROR:  relation "apartments" does not exist at character 84
2026-05-11 05:09:23.804 UTC [62090] STATEMENT:
            SELECT a.*, p.name as project_name, p.city, p.class as project_class
            FROM apartments a
            JOIN projects p ON a.project_id = p.id
            WHERE a.is_active = true
           AND a.price <= $1 ORDER BY a.price ASC
2026-05-11 05:09:23.920 UTC [62091] ERROR:  relation "apartments" does not exist at character 84
2026-05-11 05:09:23.920 UTC [62091] STATEMENT:
            SELECT a.*, p.name as project_name, p.city, p.class as project_class
            FROM apartments a
            JOIN projects p ON a.project_id = p.id
            WHERE a.is_active = true
           AND a.price <= $1 ORDER BY a.price ASC
2026-05-11 05:09:29.311 UTC [62099] ERROR:  relation "apartments" does not exist at character 84
2026-05-11 05:09:29.311 UTC [62099] STATEMENT:
            SELECT a.*, p.name as project_name, p.city, p.class as project_class
            FROM apartments a
            JOIN projects p ON a.project_id = p.id
            WHERE a.is_active = true
           AND a.price <= $1 ORDER BY a.price ASC
2026-05-11 05:09:29.418 UTC [62100] ERROR:  relation "apartments" does not exist at character 84
2026-05-11 05:09:29.418 UTC [62100] STATEMENT:
            SELECT a.*, p.name as project_name, p.city, p.class as project_class
            FROM apartments a
            JOIN projects p ON a.project_id = p.id
            WHERE a.is_active = true
           AND a.price <= $1 ORDER BY a.price ASC
2026-05-11 05:10:22.614 UTC [62171] ERROR:  relation "users" does not exist at character 15
2026-05-11 05:10:22.614 UTC [62171] STATEMENT:  SELECT * FROM users WHERE email = $1
2026-05-11 05:11:01.728 UTC [62228] ERROR:  relation "users" does not exist at character 15
2026-05-11 05:11:01.728 UTC [62228] STATEMENT:  SELECT * FROM users WHERE email = $1
root@VM-623424:/var/www/remon#