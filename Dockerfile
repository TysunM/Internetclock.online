FROM docker.io/library/nginx:alpine

# Copy all three project files into the web server directory
COPY index.html /usr/share/nginx/html
COPY style.css /usr/share/nginx/html
COPY app.js /usr/share/nginx/html

EXPOSE 80
