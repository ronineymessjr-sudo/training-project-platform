<template>
  <view class="group-list-page">
    <view class="page-header">
      <text class="page-title">我的小组</text>
    </view>

    <view class="group-list">
      <view 
        class="group-card" 
        v-for="item in groupList" 
        :key="item.id"
      >
        <view class="group-header">
          <text class="group-name">{{ item.name }}</text>
          <text class="group-role" :class="item.role">{{ item.role === 'leader' ? '组长' : '组员' }}</text>
        </view>
        
        <view class="group-project">
          <text class="project-label">所属项目：</text>
          <text class="project-name">{{ item.projectName }}</text>
        </view>
        
        <view class="member-section">
          <text class="section-label">成员列表</text>
          <view class="member-list">
            <view 
              class="member-item" 
              v-for="member in item.members" 
              :key="member.id"
            >
              <image class="member-avatar" :src="member.avatar || '/static/default-avatar.png'" mode="aspectFill" />
              <view class="member-info">
                <text class="member-name">{{ member.name }}</text>
                <text class="member-role">{{ member.role === 'leader' ? '组长' : '组员' }}</text>
              </view>
            </view>
          </view>
        </view>

        <view class="group-actions" v-if="item.role === 'leader'">
          <button class="action-btn" @click="manageMembers(item.id)">管理成员</button>
          <button class="action-btn" @click="viewWorkload(item.id)">工作量统计</button>
        </view>
      </view>

      <view v-if="groupList.length === 0" class="empty-tip">
        <text>暂未加入任何小组</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const groupList = ref<Array<{
  id: number
  name: string
  role: string
  projectName: string
  members: Array<{
    id: number
    name: string
    avatar?: string
    role: string
  }>
}>>([])

onMounted(() => {
  loadGroupList()
})

function loadGroupList() {
  groupList.value = [
    {
      id: 1,
      name: '第一小组',
      role: 'member',
      projectName: '校园二手交易平台',
      members: [
        { id: 1, name: '张三', role: 'leader', avatar: '/static/default-avatar.png' },
        { id: 2, name: '李四', role: 'member', avatar: '/static/default-avatar.png' },
        { id: 3, name: '王五', role: 'member', avatar: '/static/default-avatar.png' },
        { id: 4, name: '赵六', role: 'member', avatar: '/static/default-avatar.png' },
      ],
    },
  ]
}

function manageMembers(groupId: number) {
  uni.showToast({ title: '成员管理功能开发中', icon: 'none' })
}

function viewWorkload(groupId: number) {
  uni.showToast({ title: '工作量统计功能开发中', icon: 'none' })
}
</script>

<style lang="scss" scoped>
.group-list-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 120rpx;
}

.page-header {
  background: #fff;
  padding: 32rpx 24rpx;
  
  .page-title {
    font-size: 40rpx;
    font-weight: 600;
  }
}

.group-list {
  padding: 24rpx;
  
  .group-card {
    background: #fff;
    border-radius: 16rpx;
    padding: 32rpx;
    margin-bottom: 24rpx;
    
    .group-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20rpx;
      
      .group-name {
        font-size: 36rpx;
        font-weight: 600;
      }
      
      .group-role {
        padding: 4rpx 16rpx;
        border-radius: 20rpx;
        font-size: 24rpx;
        background: #e6f7ff;
        color: #1890ff;
        
        &.member {
          background: #f5f5f5;
          color: #666;
        }
      }
    }
    
    .group-project {
      margin-bottom: 24rpx;
      
      .project-label {
        font-size: 26rpx;
        color: #999;
      }
      
      .project-name {
        font-size: 26rpx;
        color: #333;
      }
    }
    
    .member-section {
      .section-label {
        display: block;
        font-size: 28rpx;
        font-weight: 500;
        margin-bottom: 16rpx;
      }
      
      .member-list {
        display: flex;
        flex-wrap: wrap;
        gap: 20rpx;
        
        .member-item {
          display: flex;
          align-items: center;
          background: #fafafa;
          padding: 12rpx 20rpx;
          border-radius: 32rpx;
          
          .member-avatar {
            width: 48rpx;
            height: 48rpx;
            border-radius: 24rpx;
            margin-right: 12rpx;
          }
          
          .member-info {
            .member-name {
              display: block;
              font-size: 26rpx;
              color: #333;
            }
            
            .member-role {
              font-size: 22rpx;
              color: #999;
            }
          }
        }
      }
    }
    
    .group-actions {
      display: flex;
      gap: 24rpx;
      margin-top: 24rpx;
      padding-top: 24rpx;
      border-top: 1px solid #f0f0f0;
      
      .action-btn {
        flex: 1;
        padding: 16rpx 0;
        background: #f5f5f5;
        color: #333;
        border-radius: 32rpx;
        font-size: 28rpx;
        border: none;
        
        &:active {
          background: #e8e8e8;
        }
      }
    }
  }
}

.empty-tip {
  text-align: center;
  padding: 100rpx 0;
  color: #999;
  font-size: 28rpx;
}
</style>
