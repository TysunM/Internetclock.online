# Internet Clock Online

**Ultimate free online clock with stopwatch, countdown timer, alarm clock, world time zones, and Pomodoro focus timer.**

🌐 **Live Site:** [internetclock.online](https://internetclock.online)

## ✨ Features

### 🕐 **6 Clock Modes**
- **Timer Mode** - Customizable countdown timer
- **Big Clock** - Large digital clock display
- **World Clock** - Multiple timezone display
- **Focus Mode** - Pomodoro productivity timer
- **Stopwatch** - Precision timing with start/stop
- **Alarm Clock** - Set alarms with custom times

### 🎨 **18 Beautiful Themes**
- **Cool Gradient Modern** (3 backgrounds)
- **Painting Style** (3 backgrounds)
- **Geometric Shapes** (3 backgrounds)  
- **Imaginative** (3 backgrounds)
- **Cartoons** (3 backgrounds)
- **Anime** (3 backgrounds)

### 📱 **Production Ready**
- Fully responsive design
- SEO optimized
- Advertiser-friendly layout
- Professional contact system
- Theme persistence
- Error handling

---

## 🚀 Quick Start

### **Prerequisites**
- Node.js (LTS version)
- Nginx web server
- Git

### **1. Clone and Setup**
```bash
git clone https://github.com/TysunM/internet-clock.git
cd internet-clock
npm install
```

### **2. Replace Files**
Replace these files with the updated versions from the artifacts:

**Core Files:**
- `Index.html` → New HTML structure
- `styles/main.css` → New CSS with themes
- `scripts/app.js` → New JavaScript with functionality
- `package.json` → Updated configuration
- `robots.txt` → Domain-specific SEO
- `sitemap.xml` → Search engine sitemap

**Build Scripts:**
- `build.sh` → Enhanced build process
- `deploy-to-production.sh` → Production deployment
- `test-integration.sh` → Testing script

**Server Config:**
- `nginx.conf` → Web server configuration
- `Dockerfile` → Container deployment

### **3. Make Scripts Executable**
```bash
chmod +x build.sh
chmod +x deploy-to-production.sh
chmod +x test-integration.sh
```

### **4. Test Integration**
```bash
./test-integration.sh
```

### **5. Deploy to Production**
```bash
sudo ./deploy-to-production.sh
```

---

## 🧪 Testing Checklist

### **Local Testing**
- [ ] Build process completes without errors
- [ ] All 6 clock modes switch properly
- [ ] Breadcrumb navigation changes colors
- [ ] Themes dropdown opens and applies backgrounds
- [ ] Settings dropdown shows contact email
- [ ] Mobile responsive design works
- [ ] No JavaScript console errors

### **Live Testing**
- [ ] Site loads at internetclock.online
- [ ] All functionality works on live site
- [ ] SSL certificate is active
- [ ] SEO meta tags are correct
- [ ] Google Search Console sitemap submitted

---

## 📁 Project Structure

```
internet-clock/
├── Index.html              # Main HTML file
├── package.json            # Project configuration
├── robots.txt              # SEO robots file
├── sitemap.xml            # Search engine sitemap
├── styles/
│   └── main.css           # Main stylesheet with themes
├── scripts/
│   └── app.js             # Main JavaScript functionality
├── assets/                # Images and static files
├── build.sh              # Build script
├── deploy-to-production.sh # Deployment script
├── test-integration.sh    # Testing script
├── nginx.conf            # Web server config
└── Dockerfile            # Container config
```

---

## 🔧 Configuration

### **Domain Setup**
The project is configured for `internetclock.online`:
- robots.txt points to correct sitemap
- sitemap.xml uses correct domain
- nginx.conf serves correct domain
- package.json homepage updated

### **Contact Information**
Support email configured as: `tserver@internetclock.online`

### **Theme System**
- 6 categories with 3 backgrounds each
- Themes persist using localStorage
- Responsive design for all screen sizes
- Smooth animations and transitions

---

## 🛠 Build Process

### **Manual Build**
```bash
npm run build
```

### **Test Locally**
```bash
npm run test-local
```

### **Docker Build**
```bash
npm run docker-build
npm run docker-run
```

---

## 🚀 Deployment Options

### **Option 1: Direct Server Deployment**
```bash
sudo ./deploy-to-production.sh
```

### **Option 2: Docker Deployment**
```bash
npm run docker-deploy
```

### **Option 3: Manual Deployment**
```bash
npm run build
sudo cp -r dist/* /var/www/bigbigtime.com/BigBigTime/dist/
sudo chown -R nginx:nginx /var/www/bigbigtime.com/BigBigTime/dist/
sudo systemctl reload nginx
```

---

## 📊 Performance Features

- **Gzip compression** for faster loading
- **Static file caching** with 1-year expiry
- **Security headers** for protection
- **Optimized images** and assets
- **Clean, semantic HTML** for SEO
- **Responsive design** for all devices

---

## 🐛 Troubleshooting

### **Build Fails**
1. Check if all required files exist
2. Verify Node.js and npm are installed
3. Run `npm install` to install dependencies
4. Check file permissions on build.sh

### **Site Not Loading**
1. Verify nginx configuration: `sudo nginx -t`
2. Check if files are in correct location
3. Verify domain DNS settings
4. Check nginx error logs: `sudo tail -f /var/log/nginx/error.log`

### **JavaScript Errors**
1. Check browser console for errors
2. Verify all script files are loading
3. Test themes dropdown functionality
4. Check localStorage permissions

---

## 📈 SEO & Analytics Ready

- **Meta tags** optimized for search engines
- **Structured data** for rich snippets
- **Sitemap** for search engine indexing
- **robots.txt** for crawler guidance
- **Performance optimized** for Core Web Vitals
- **Mobile-friendly** design

---

## 🔒 Security Features

- **CSP headers** for content security
- **XSS protection** enabled
- **MIME type sniffing** disabled
- **Clickjacking protection** via X-Frame-Options
- **Secure cookies** and session handling

---

## 📞 Support

For technical issues or feedback, contact: **tserver@internetclock.online**

---

## 📄 License

MIT License - see LICENSE file for details.

---

**Ready for production deployment to internetclock.online! 🎉**
