<template>
  <view class="score-list-page">
    <view class="page-header">
      <text class="page-title">我的成绩</text>
    </view>

    <!-- 成绩概览 -->
    <view class="score-overview">
      <view class="total-score">
        <text class="score-value">{{ totalScore }}</text>
        <text class="score-label">总分</text>
      </view>
      <view class="score-breakdown">
        <view class="breakdown-item">
          <text class="item-label">指导评分</text>
          <text class="item-value">{{ scores.guideScore || '-' }}</text>
        </view>
        <view class="breakdown-item">
          <text class="item-label">评阅评分</text>
          <text class="item-value">{{ scores.reviewScore || '-' }}</text>
        </view>
        <view class="breakdown-item">
          <text class="item-label">答辩评分</text>
          <text class="item-value">{{ scores.defenseScore || '-' }}</text>
        </view>
      </view>
    </view>

    <!-- 详细评分 -->
    <view class="score-detail">
      <view class="detail-title">评分详情</view>
      
      <view class="detail-card">
        <view class="card-header">
          <text class="card-title">指导教师评分</text>
          <text class="card-score">{{ scores.guideScore || '-' }}</text>
        </view>
        <view class="card-content" v-if="scores.guideComment">
          <text class="comment-text">{{ scores.guideComment }}</text>
        </view>
      </view>
      
      <view class="detail-card">
        <view class="card-header">
          <text class="card-title">评阅教师评分</text>
          <text class="card-score">{{ scores.reviewScore || '-' }}</text>
        </view>
        <view class="card-content" v-if="scores.reviewComment">
          <text class="comment-text">{{ scores.reviewComment }}</text>
        </view>
      </view>
      
      <view class="detail-card">
        <view class="card-header">
          <text class="card-title">答辩评分</text>
          <text class="card-score">{{ scores.defenseScore || '-' }}</text>
        </view>
        <view class="card-content" v-if="scores.defenseComment">
          <text class="comment-text">{{ scores.defenseComment }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const scores = ref({
  guideScore: 85,
  guideComment: '项目整体完成度较高，文档规范，继续保持。',
  reviewScore: 88,
  reviewComment: '系统设计合理，功能实现完整，推荐答辩。',
  defenseScore: 90,
  defenseComment: '答辩表现良好，回答问题准确清晰。',
})

const totalScore = computed(() => {
  const { guideScore, reviewScore, defenseScore } = scores.value
  if (!guideScore || !reviewScore || !defenseScore) return '待评分'
  return Math.round((guideScore + reviewScore + defenseScore) / 3)
})
</script>

<style lang="scss" scoped>
.score-list-page {
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

.score-overview {
  background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
  padding: 48rpx 32rpx;
  margin: 24rpx;
  border-radius: 24rpx;
  color: #fff;
  
  .total-score {
    text-align: center;
    margin-bottom: 40rpx;
    
    .score-value {
      display: block;
      font-size: 96rpx;
      font-weight: 700;
      line-height: 1;
    }
    
    .score-label {
      font-size: 28rpx;
      opacity: 0.8;
      margin-top: 12rpx;
    }
  }
  
  .score-breakdown {
    display: flex;
    justify-content: space-around;
    padding-top: 32rpx;
    border-top: 1px solid rgba(255, 255, 255, 0.2);
    
    .breakdown-item {
      text-align: center;
      
      .item-label {
        display: block;
        font-size: 24rpx;
        opacity: 0.8;
        margin-bottom: 8rpx;
      }
      
      .item-value {
        font-size: 36rpx;
        font-weight: 600;
      }
    }
  }
}

.score-detail {
  padding: 0 24rpx;
  
  .detail-title {
    font-size: 32rpx;
    font-weight: 600;
    margin-bottom: 20rpx;
  }
  
  .detail-card {
    background: #fff;
    border-radius: 16rpx;
    padding: 32rpx;
    margin-bottom: 20rpx;
    
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16rpx;
      
      .card-title {
        font-size: 30rpx;
        font-weight: 500;
      }
      
      .card-score {
        font-size: 36rpx;
        font-weight: 600;
        color: #1890ff;
      }
    }
    
    .card-content {
      padding: 20rpx;
      background: #fafafa;
      border-radius: 12rpx;
      
      .comment-text {
        font-size: 26rpx;
        color: #666;
        line-height: 1.6;
      }
    }
  }
}
</style>
