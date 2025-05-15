import mongoose from 'mongoose';

const SettingsSchema = new mongoose.Schema({
  siteName: {
    type: String,
    default: 'Nhà Sách Online'
  },
  siteDescription: {
    type: String,
    default: 'Nơi bạn có thể tìm thấy mọi thể loại sách bạn yêu thích với giá cả hợp lý và dịch vụ chất lượng.'
  },
  logoPath: {
    type: String,
    default: '/images/logo.png'
  },
  faviconPath: {
    type: String,
    default: '/images/favicon.ico'
  },
  footer: {
    companyName: {
      type: String,
      default: 'Nhà Sách Online'
    },
    description: {
      type: String,
      default: 'Nơi bạn có thể tìm thấy mọi thể loại sách bạn yêu thích với giá cả hợp lý và dịch vụ chất lượng.'
    },
    address: {
      type: String,
      default: '123 Đường ABC, Quận XYZ, TP. HCM'
    },
    phone: {
      type: String,
      default: '(84) 123 456 789'
    },
    email: {
      type: String,
      default: 'info@nhasachonline.com'
    },
    workingHours: {
      type: String,
      default: 'Thứ 2 - Thứ 7: 8h - 20h'
    },
    copyright: {
      type: String,
      default: '© 2025 Nhà Sách Online. Tất cả các quyền được bảo lưu.'
    }
  },
  socialLinks: {
    facebook: {
      type: String,
      default: '#'
    },
    twitter: {
      type: String,
      default: '#'
    },
    instagram: {
      type: String,
      default: '#'
    },
    youtube: {
      type: String,
      default: '#'
    }
  },
  legalLinks: {
    terms: {
      type: String,
      default: '#'
    },
    privacy: {
      type: String,
      default: '#'
    }
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Ensure there's only one settings document
SettingsSchema.statics.getSiteSettings = async function() {
  const settings = await this.findOne();
  if (settings) {
    return settings;
  }
  
  // If no settings exist, create default settings
  return await this.create({});
};

const Settings = mongoose.model('Settings', SettingsSchema);

export default Settings; 