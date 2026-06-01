<template>
  <view class="login-page">
    <view class="logo-section">
      <image class="logo" src="/static/logo.png" mode="aspectFit" />
      <text class="app-name">实训项目管理平台</text>
      <text class="app-desc">Training Project Management</text>
    </view>

    <view class="login-form">
      <view class="form-item">
        <view class="form-label">用户名</view>
        <input 
          v-model="formData.username"
          type="text"
          placeholder="请输入用户名"
          class="form-input"
        />
      </view>
      
      <view class="form-item">
        <view class="form-label">密码</view>
        <input 
          v-model="formData.password"
          type="password"
          placeholder="请输入密码"
          class="form-input"
        />
      </view>

      <view class="form-item">
        <checkbox-group @change="onRememberChange">
          <label class="remember-label">
            <checkbox :checked="formData.remember" color="#1890ff" />
            <text>记住密码</text>
          </label>
        </checkbox-group>
      </view>

      <button class="btn-primary login-btn" @click="handleLogin" :loading="loading">
        {{ loading ? '登录中...' : '登录' }}
      </button>
    </view>

    <view class="login-footer">
      <text class="footer-text">还没有账号？联系管理员开通</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const formData = ref({
  username: '',
  password: '',
  remember: false,
})

const loading = ref(false)

// 从本地存储恢复记住的账号
const savedUsername = uni.getStorageSync('savedUsername')
if (savedUsername) {
  formData.value.username = savedUsername
  formData.value.remember = true
}

function onRememberChange(e: any) {
  formData.value.remember = e.detail.value.length > 0
}

async function handleLogin() {
  if (!formData.value.username) {
    uni.showToast({ title: '请输入用户名', icon: 'none' })
    return
  }
  if (!formData.value.password) {
    uni.showToast({ title: '请输入密码', icon: 'none' })
    return
  }

  loading.value = true
  
  try {
    // 模拟登录
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 保存token和用户信息
    uni.setStorageSync('token', 'mock_token_' + Date.now())
    uni.setStorageSync('userInfo', JSON.stringify({
      id: 1,
      name: formData.value.username,
      role: 'student',
      avatar: '/static/default-avatar.png',
    }))

    if (formData.value.remember) {
      uni.setStorageSync('savedUsername', formData.value.username)
    } else {
      uni.removeStorageSync('savedUsername')
    }

    uni.showToast({ title: '登录成功', icon: 'success' })
    
    setTimeout(() => {
      uni.switchTab({ url: '/pages/index/index' })
    }, 500)
  } catch (error) {
    uni.showToast({ title: '登录失败，请重试', icon: 'none' })
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #1890ff 0%, #096dd9 100%);
  padding: 120rpx 60rpx 60rpx;
}

.logo-section {
  text-align: center;
  margin-bottom: 80rpx;
  
  .logo {
    width: 160rpx;
    height: 160rpx;
    margin-bottom: 32rpx;
  }
  
  .app-name {
    display: block;
    font-size: 48rpx;
    font-weight: 600;
    color: #fff;
    margin-bottom: 16rpx;
  }
  
  .app-desc {
    display: block;
    font-size: 28rpx;
    color: rgba(255, 255, 255, 0.7);
  }
}

.login-form {
  background: #fff;
  border-radius: 24rpx;
  padding: 48rpx 40rpx;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.1);
  
  .form-item {
    margin-bottom: 32rpx;
    
    .form-label {
      font-size: 28rpx;
      color: #333;
      margin-bottom: 16rpx;
    }
    
    .form-input {
      height: 88rpx;
      padding: 0 24rpx;
      border: 2rpx solid #e8e8e8;
      border-radius: 44rpx;
      font-size: 28rpx;
      background: #fafafa;
      transition: all 0.3s;
      
      &:focus {
        border-color: #1890ff;
        background: #fff;
      }
    }
    
    .remember-label {
      display: flex;
      align-items: center;
      gap: 12rpx;
      font-size: 26rpx;
      color: #666;
    }
  }
  
  .login-btn {
    margin-top: 32rpx;
    width: 100%;
  }
}

.login-footer {
  text-align: center;
  margin-top: 48rpx;
  
  .footer-text {
    font-size: 26rpx;
    color: rgba(255, 255, 255, 0.7);
  }
}
</style>
