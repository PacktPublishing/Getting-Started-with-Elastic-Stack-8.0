FROM nginx

# First, copy in the nginx configuration file (above)
COPY nginx.conf /etc/nginx/nginx.conf

# Magic commands to grant the required permissions to the nginx user
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    chown -R nginx:nginx /etc/nginx/conf.d

# nginx also needs access to the pid file, which needs to be created first
RUN touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid

# Run as nginx user
USER 101

# Copy the static website into the default location
COPY html /usr/share/nginx/html