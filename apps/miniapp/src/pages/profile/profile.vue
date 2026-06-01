<template>
  <view class="profile-page">
    <!-- 用户信息卡片 -->
    <view class="profile-card">
      <view class="user-info">
        <image class="avatar" :src="userInfo.avatar || '/static/default-avatar.png'" mode="aspectFill" />
        <view class="info-text">
          <text class="name">{{ userInfo.name }}</text>
          <text class="role-tag">{{ getRoleText(userInfo.role) }}</text>
        </view>
      </view>
    </view>

    <!-- 菜单列表 -->
    <view class="menu-list">
      <view class="menu-item" @click="goPage('/pages/project/list')">
        <view class="menu-left">
          <text class="menu-icon">📋</text>
          <text class="menu-text">我的项目</text>
        </view>
        <text class="menu-arrow">></text>
      </view>
      
      <view class="menu-item" @click="goPage('/pages/group/list')">
        <view class="menu-left">
          <text class="menu-icon">👥</text>
          <text class="menu-text">我的小组</text>
        </view>
        <text class="menu-arrow">></text>
      </view>
      
      <view class="menu-item" @click="goPage('/pages/score/list')">
        <view class="menu-left">
          <text class="menu-icon">📊</text>
          <text class="menu-text">我的成绩</text>
        </view>
        <text class="menu-arrow">></text>
      </view>
      
      <view class="menu-item" @click="handleExport">
        <view class="menu-left">
          <text class="menu-icon">📥</text>
          <text class="menu-text">导出成绩单</text>
        </view>
        <text class="menu-arrow">></text>
      </view>
    </view>

    <view class="menu-list">
      <view class="menu-item" @click="goPage('/pages/profile/edit')">
        <view class="menu-left">
          <text class="menu-icon">⚙️</text>
          <text class="menu-text">个人信息</text>
        </view>
        <text class="menu-arrow">></text>
      </view>
      
      <view class="menu-item" @click="showAbout">
        <view class="menu-left">
          <text class="menu-icon">ℹ️</text>
          <text class="menu-text">关于我们</text>
        </view>
        <text class="menu-arrow">></text>
      </view>
    </view>

    <!-- 退出登录 -->
    <view class="logout-section">
      <button class="logout-btn" @click="handleLogout">退出登录</button>
    </view>

    <!-- 版本信息 -->
    <view class="version-info">
      <text>v1.0.0</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const userInfo = ref<{
  name: string
  role: string
  avatar: string
}>({
  name: '张三',
  role: 'student',
  avatar: '/static/default-avatar.png',
})

onMounted(() => {
  const userData = uni.getStorageSync('userInfo')
  if (userData) {
    userInfo.value = JSON.parse(userData)
  }
})

function getRoleText(role: string): string {
  const map: Record<string, string> = {
    admin: '管理员',
    teacher: '教师',
    student: '学生',
  }
  return map[role] || role
}

function goPage(url: string) {
  uni.navigateTo({ url })
}

function handleExport() {
  uni.showToast({ title: '正在生成成绩单...', icon: 'loading' })
  // 实际应调用导出API
  setTimeout(() => {
    uni.showToast({ title: '成绩单已生成', icon: 'success' })
  }, 1500)
}

function showAbout() {
  uni.showModal({
    title: '关于我们',
    content: '实训项目全过程管理平台 v1.0.0\n\n为高校实训教学提供全流程管理服务',
    showCancel: false,
  })
}

function handleLogout() {
  uni.showModal({
    title: '确认退出',
    content: '确定要退出登录吗？',
    success: (res) => {
      if (res.confirm) {
        uni.clearStorageSync()
        uni.reLaunch({ url: '/pages/login/login' })
      }
    },
  })
}
</script>

<style lang="scss" scoped>
.profile-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 120rpx;
}

.profile-card {
  background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
  padding: 48rpx 32rpx;
  
  .user-info {
    display: flex;
    align-items: center;
    
    .avatar {
      width: 120rpx;
      height: 120rpx;
      border-radius: 60rpx;
      border: 4rpx solid rgba(255, 255, 255, 0.5);
      margin-right: 32rpx;
    }
    
    .info-text {
      .name {
        display: block;
        font-size: 40rpx;
        font-weight: 600;
        color: #fff;
        margin-bottom: 12rpx;
      }
      
      .role-tag {
        display: inline-block;
        background: rgba(255, 255, 255, 0.2);
        color: #fff;
        padding: 4rpx 16rpx;
        border-radius: 20rpx;
        font-size: 24rpx;
      }
    }
  }
}

.menu-list {
  background: #fff;
  margin-top: 24rpx;
  
  .menu-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 32rpx;
    border-bottom: 1px solid #f0f0f0;
    
    &:last-child {
      border-bottom: none;
    }
    
    .menu-left {
      display: flex;
      align-items: center;
      
      .menu-icon {
        font-size: 40rpx;
        margin-right: 20rpx;
      }
      
      .menu-text {
        font-size: 30rpx;
        color: #333;
      }
    }
    
    .menu-arrow {
      color: #ccc;
      font-size: 28rpx;
    }
  }
}

.logout-section {
  padding: 48rpx 32rpx;
  
  .logout-btn {
    width: 100%;
    height: 88rpx;
    background: #fff;
    border: none;
    border-radius: 44rpx;
    color: #ff4d4f;
    font-size: 32rpx;
  }
}

.version-info {
  text-align: center;
  color: #ccc;
  font-size: 24rpx;
  padding: 24rpx;
}
</style>
