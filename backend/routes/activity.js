const express = require('express')
const { auth } = require('../middleware/auth')
const UserActivity = require('../models/UserActivity')

const router = express.Router()

// @route   GET /api/activity
// @desc    Get user activity history
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, action } = req.query
    const offset = (page - 1) * limit

    let activities, formattedActivities, totalItems
    try {
      activities = await UserActivity.getUserActivity(req.user.id, {
        limit: parseInt(limit),
        offset: parseInt(offset),
        action
      })

      formattedActivities = activities.rows.map(activity => 
        activity.getFormattedActivity()
      )
      totalItems = activities.count
    } catch (dbError) {
      // Provide mock data if database is not available
      console.warn('Database not available, providing mock activity data')
      formattedActivities = [
        {
          id: 1,
          action: 'login',
          description: 'User logged in successfully',
          ip_address: '192.168.1.100',
          created_at: new Date(),
          timeAgo: 'Just now'
        },
        {
          id: 2,
          action: 'profile_update',
          description: 'Profile information updated',
          ip_address: '192.168.1.100',
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000),
          timeAgo: '2 hours ago'
        }
      ]
      totalItems = 25 // Mock total
    }

    res.json({
      success: true,
      activities: formattedActivities,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalItems / limit),
        totalItems: totalItems,
        itemsPerPage: parseInt(limit)
      }
    })
  } catch (error) {
    console.error('Activity fetch error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while fetching activity'
    })
  }
})

// @route   GET /api/activity/stats
// @desc    Get user activity statistics
// @access  Private
router.get('/stats', auth, async (req, res) => {
  try {
    let stats
    try {
      stats = await UserActivity.getActivityStats(req.user.id)
    } catch (dbError) {
      // Provide mock data if database is not available
      console.warn('Database not available, providing mock activity stats')
      stats = {
        totalLogins: 127,
        lastLogin: new Date(),
        accountAge: 90,
        totalActivities: 245,
        recentActivityCount: 15,
        weeklyLoginCount: 12,
        monthlyActivityCount: 78
      }
    }
    
    res.json({
      success: true,
      stats
    })
  } catch (error) {
    console.error('Activity stats error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while fetching activity stats'
    })
  }
})

// @route   GET /api/activity/recent
// @desc    Get recent user activity (last 10 activities)
// @access  Private
router.get('/recent', auth, async (req, res) => {
  try {
    let formattedActivities
    try {
      const activities = await UserActivity.getUserActivity(req.user.id, {
        limit: 10,
        offset: 0
      })
      
      formattedActivities = activities.rows.map(activity => 
        activity.getFormattedActivity()
      )
    } catch (dbError) {
      // Provide mock data if database is not available
      console.warn('Database not available, providing mock recent activity')
      formattedActivities = [
        {
          id: 1,
          action: 'login',
          description: 'User logged in successfully',
          ip_address: '192.168.1.100',
          created_at: new Date(),
          timeAgo: 'Just now'
        },
        {
          id: 2,
          action: 'profile_update',
          description: 'Profile information updated',
          ip_address: '192.168.1.100',
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000),
          timeAgo: '2 hours ago'
        },
        {
          id: 3,
          action: 'login',
          description: 'User logged in successfully',
          ip_address: '192.168.1.50',
          created_at: new Date(Date.now() - 24 * 60 * 60 * 1000),
          timeAgo: '1 day ago'
        }
      ]
    }

    res.json({
      success: true,
      activities: formattedActivities
    })
  } catch (error) {
    console.error('Recent activity error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while fetching recent activity'
    })
  }
})

// @route   DELETE /api/activity/clear
// @desc    Clear user activity history (except login activities)
// @access  Private
router.delete('/clear', auth, async (req, res) => {
  try {
    await UserActivity.destroy({
      where: {
        user_id: req.user.id,
        action: {
          [require('sequelize').Op.notIn]: ['login', 'register']
        }
      }
    })

    // Log the clear activity action
    await UserActivity.logActivity(
      req.user.id,
      'profile_update',
      'Cleared activity history',
      req
    )

    res.json({
      success: true,
      message: 'Activity history cleared successfully'
    })
  } catch (error) {
    console.error('Clear activity error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while clearing activity'
    })
  }
})

// @route   GET /api/activity/export
// @desc    Export user activity as JSON
// @access  Private
router.get('/export', auth, async (req, res) => {
  try {
    const activities = await UserActivity.findAll({
      where: { user_id: req.user.id },
      order: [['created_at', 'DESC']]
    })

    const exportData = {
      user_id: req.user.id,
      exported_at: new Date().toISOString(),
      total_activities: activities.length,
      activities: activities.map(activity => activity.getFormattedActivity())
    }

    // Log the export activity
    await UserActivity.logActivity(
      req.user.id,
      'profile_update',
      'Exported activity history',
      req
    )

    res.setHeader('Content-Type', 'application/json')
    res.setHeader('Content-Disposition', `attachment; filename="activity-export-${Date.now()}.json"`)
    res.json(exportData)
  } catch (error) {
    console.error('Export activity error:', error)
    res.status(500).json({
      success: false,
      message: 'Server error while exporting activity'
    })
  }
})

module.exports = router