# Use a lightweight, official Nginx image as a parent image
FROM nginx:alpine

# Remove the default Nginx website
RUN rm -rf /usr/share/nginx/html/*

# Copy our custom Nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the static website files to the Nginx webroot
COPY . /usr/share/nginx/html

# Expose port 80 to the outside world
EXPOSE 80

# The command to start Nginx when the container launches
CMD ["nginx", "-g", "daemon off;"]
