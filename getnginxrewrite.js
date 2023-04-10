// user  nginx;
// worker_processes  auto;

// error_log  /var/log/nginx/error.log notice;
// pid        /var/run/nginx.pid;

// events {
//     use epoll;
//     worker_connections  51200;
//     multi_accept on;
// }

// http {
//     include       /etc/nginx/mime.types;
//     default_type  application/octet-stream;

//     log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '
//                       '$status $body_bytes_sent "$http_referer" '
//                       '"$http_user_agent" "$http_x_forwarded_for"';

//     # access_log  /var/log/nginx/access.log  main;

//     sendfile        on;
//     tcp_nopush     on;

//     keepalive_timeout  65;

//     #gzip  on;

//     include /etc/nginx/conf.d/*.conf;

//      gzip on;
//         gzip_min_length  1k;
//         gzip_buffers     4 16k;
//         gzip_http_version 1.1;
//         gzip_comp_level 2;
//         gzip_types     text/plain application/javascript application/x-javascript text/javascript text/css application/xml;
//         gzip_vary on;
//         gzip_proxied   expired no-cache no-store private auth;
//         gzip_disable   "MSIE [1-6]\.";

//     # 关闭访问日志
//     access_log off;
//     server_names_hash_bucket_size 512;
//     client_header_buffer_size 16k;
//     large_client_header_buffers 4 32k;
//     client_max_body_size 2m;
//     tcp_nodelay on;
//     server_tokens off;

//     server {
//         listen 443 ssl;
//         server_name developer.authdog.cn;
//         index index.html;
//         root /data/www/dist-pro;

//         ssl_certificate /data/pem/developer.authdog.cn.pem;
//         ssl_certificate_key /data/pem/developer.authdog.cn.key;

//         ssl_protocols TLSv1 TLSv1.1 TLSv1.2;
//         ssl_ciphers 'TLS_AES_128_GCM_SHA256:TLS_AES_256_GCM_SHA384:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384';

//         location ~ ^/(\.user.ini|\.htaccess|\.git|\.env|\.svn|\.project|LICENSE|README.md)
//         {
//             return 404;
//         }

//         location /api {
//             proxy_pass http://127.0.0.1:3000;
//         }
//     }

//     server {
//         listen 443 ssl;
//         server_name saler.authdog.cn;
//         index index.html;
//         root /data/www/dist-pro;

//         ssl_certificate /data/pem/saler.authdog.cn.pem;
//         ssl_certificate_key /data/pem/saler.authdog.cn.key;

//         ssl_protocols TLSv1 TLSv1.1 TLSv1.2;
//         ssl_ciphers 'TLS_AES_128_GCM_SHA256:TLS_AES_256_GCM_SHA384:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384';

//         location ~ ^/(\.user.ini|\.htaccess|\.git|\.env|\.svn|\.project|LICENSE|README.md)
//         {
//             return 404;
//         }

//         location /api {
//             proxy_pass http://127.0.0.1:3000;
//         }
//     }

//     server {
//         listen 443 ssl;
//         server_name api.authdog.cn;

//         ssl_certificate /data/pem/api.authdog.cn.pem;
//         ssl_certificate_key /data/pem/api.authdog.cn.key;

//         ssl_protocols TLSv1 TLSv1.1 TLSv1.2;
//         ssl_ciphers 'TLS_AES_128_GCM_SHA256:TLS_AES_256_GCM_SHA384:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384';

//         location / {
//             return 404;
//         }

//         location /api {
//             proxy_pass http://127.0.0.1:3000;
//         }
//     }

// }

const paths = [
    '/api/v1/user/public/register',
    '/api/v1/user/public/login',
    '/api/v1/user/public/change-password',
    '/api/v1/user/public/unbind',
    '/api/v1/user/public/recharge',
    '/api/v1/user/poll',
    '/api/v1/user/reduce-count',
    '/api/v1/device/auth',
    '/api/v1/device/recharge',
    '/api/v1/device/info',
    '/api/v1/device/reduce-count',
    '/api/v1/cloudvar/get',
    '/api/v1/cloudfun/run',
    '/api/v1/userdata/create',
    '/api/v1/userdata/getByUniqueValue',
    '/api/v1/userdata/getListByName',
    '/api/v1/userdata/getListByName',
    '/api/v1/userdata/delete',
    '/api/v1/userdata/update',
    '/api/v1/app/info',
    '/api/v1/feedback/send',
];

const crypto = require('crypto');

paths.map((path) => {
    const hash = crypto.createHash('md5').update(path.replace('/api/', '')).digest('hex');
    console.log(`rewrite ^/api/${hash} ${path} last;`);
});
