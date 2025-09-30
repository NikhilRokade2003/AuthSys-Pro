const cloudinary = require('cloudinary').v2
const { Readable } = require('stream')

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
})

/**
 * Upload buffer to Cloudinary
 * @param {Buffer} buffer - File buffer
 * @param {string} folder - Cloudinary folder path
 * @param {Object} options - Upload options
 * @returns {Promise<Object>} Upload result
 */
async function uploadToCloudinary(buffer, folder = 'uploads', options = {}) {
  return new Promise((resolve, reject) => {
    // Default options
    const defaultOptions = {
      folder,
      resource_type: 'auto',
      quality: 'auto',
      fetch_format: 'auto',
      ...options,
    }

    // Create upload stream
    const uploadStream = cloudinary.uploader.upload_stream(
      defaultOptions,
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error)
          reject(new Error(`Upload failed: ${error.message}`))
        } else {
          resolve(result)
        }
      }
    )

    // Create readable stream from buffer
    const bufferStream = new Readable({
      read() {
        this.push(buffer)
        this.push(null)
      },
    })

    // Pipe buffer to upload stream
    bufferStream.pipe(uploadStream)
  })
}

/**
 * Upload image with optimization
 * @param {Buffer} buffer - Image buffer
 * @param {string} folder - Cloudinary folder path
 * @param {Object} transformOptions - Image transformation options
 * @returns {Promise<Object>} Upload result
 */
async function uploadImage(buffer, folder = 'images', transformOptions = {}) {
  const defaultTransformOptions = {
    width: 1200,
    height: 1200,
    crop: 'limit',
    quality: 'auto:good',
    format: 'webp',
    ...transformOptions,
  }

  try {
    const result = await uploadToCloudinary(buffer, folder, {
      resource_type: 'image',
      ...defaultTransformOptions,
    })

    return result
  } catch (error) {
    throw new Error(`Image upload failed: ${error.message}`)
  }
}

/**
 * Upload avatar with specific optimizations
 * @param {Buffer} buffer - Avatar image buffer
 * @param {string} userId - User ID for folder organization
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} Upload result
 */
async function uploadAvatar(buffer, userId, options = {}) {
  const transformOptions = {
    width: 300,
    height: 300,
    crop: 'fill',
    gravity: 'face',
    quality: 'auto:good',
    format: 'webp',
    ...options,
  }

  try {
    const result = await uploadImage(
      buffer,
      `avatars/${userId}`,
      transformOptions
    )

    return {
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes,
    }
  } catch (error) {
    throw new Error(`Avatar upload failed: ${error.message}`)
  }
}

/**
 * Delete file from Cloudinary
 * @param {string} publicId - Cloudinary public ID
 * @param {string} resourceType - Resource type ('image', 'video', 'raw')
 * @returns {Promise<Object>} Deletion result
 */
async function deleteFromCloudinary(publicId, resourceType = 'image') {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    })

    if (result.result === 'ok') {
      return {
        success: true,
        message: 'File deleted successfully',
        result,
      }
    } else {
      throw new Error(`Deletion failed: ${result.result}`)
    }
  } catch (error) {
    console.error('Cloudinary deletion error:', error)
    throw new Error(`Delete failed: ${error.message}`)
  }
}

/**
 * Get optimized image URL
 * @param {string} publicId - Cloudinary public ID
 * @param {Object} transformOptions - Transformation options
 * @returns {string} Optimized image URL
 */
function getOptimizedImageUrl(publicId, transformOptions = {}) {
  const defaultOptions = {
    quality: 'auto',
    fetch_format: 'auto',
    ...transformOptions,
  }

  return cloudinary.url(publicId, defaultOptions)
}

/**
 * Generate responsive image URLs
 * @param {string} publicId - Cloudinary public ID
 * @param {Array} breakpoints - Array of breakpoint objects
 * @returns {Object} Responsive image URLs
 */
function generateResponsiveUrls(publicId, breakpoints = []) {
  const defaultBreakpoints = [
    { name: 'mobile', width: 480 },
    { name: 'tablet', width: 768 },
    { name: 'desktop', width: 1200 },
    { name: 'large', width: 1920 },
  ]

  const responsiveBreakpoints = breakpoints.length > 0 ? breakpoints : defaultBreakpoints
  const urls = {}

  responsiveBreakpoints.forEach(breakpoint => {
    urls[breakpoint.name] = cloudinary.url(publicId, {
      width: breakpoint.width,
      crop: 'scale',
      quality: 'auto',
      fetch_format: 'auto',
    })
  })

  return urls
}

/**
 * Upload multiple files
 * @param {Array} files - Array of file objects with buffer and options
 * @param {string} folder - Cloudinary folder path
 * @returns {Promise<Array>} Array of upload results
 */
async function uploadMultipleFiles(files, folder = 'uploads') {
  const uploadPromises = files.map(file => {
    const { buffer, options = {} } = file
    return uploadToCloudinary(buffer, folder, options)
  })

  try {
    const results = await Promise.all(uploadPromises)
    return results
  } catch (error) {
    throw new Error(`Multiple file upload failed: ${error.message}`)
  }
}

/**
 * Get file info from Cloudinary
 * @param {string} publicId - Cloudinary public ID
 * @param {string} resourceType - Resource type
 * @returns {Promise<Object>} File information
 */
async function getFileInfo(publicId, resourceType = 'image') {
  try {
    const result = await cloudinary.api.resource(publicId, {
      resource_type: resourceType,
    })

    return {
      publicId: result.public_id,
      format: result.format,
      width: result.width,
      height: result.height,
      bytes: result.bytes,
      url: result.secure_url,
      createdAt: result.created_at,
      uploadedAt: result.uploaded_at,
    }
  } catch (error) {
    console.error('Cloudinary get file info error:', error)
    throw new Error(`Get file info failed: ${error.message}`)
  }
}

/**
 * Search files in Cloudinary
 * @param {Object} searchOptions - Search options
 * @returns {Promise<Object>} Search results
 */
async function searchFiles(searchOptions = {}) {
  const defaultOptions = {
    resource_type: 'image',
    type: 'upload',
    max_results: 50,
    ...searchOptions,
  }

  try {
    const result = await cloudinary.search
      .expression(defaultOptions.expression || '')
      .max_results(defaultOptions.max_results)
      .execute()

    return result
  } catch (error) {
    console.error('Cloudinary search error:', error)
    throw new Error(`Search failed: ${error.message}`)
  }
}

/**
 * Create archive (zip) of multiple files
 * @param {Array} publicIds - Array of public IDs
 * @param {Object} options - Archive options
 * @returns {Promise<Object>} Archive result
 */
async function createArchive(publicIds, options = {}) {
  const defaultOptions = {
    resource_type: 'image',
    type: 'upload',
    format: 'zip',
    ...options,
  }

  try {
    const result = await cloudinary.utils.archive_url({
      public_ids: publicIds,
      ...defaultOptions,
    })

    return result
  } catch (error) {
    console.error('Cloudinary archive error:', error)
    throw new Error(`Archive creation failed: ${error.message}`)
  }
}

/**
 * Validate Cloudinary configuration
 * @returns {boolean} True if configured properly
 */
function validateConfiguration() {
  const { cloud_name, api_key, api_secret } = cloudinary.config()
  
  if (!cloud_name || !api_key || !api_secret) {
    console.error('Cloudinary configuration missing. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET environment variables.')
    return false
  }

  return true
}

/**
 * Get upload preset
 * @param {string} presetName - Name of the upload preset
 * @returns {Promise<Object>} Upload preset details
 */
async function getUploadPreset(presetName) {
  try {
    const result = await cloudinary.api.upload_preset(presetName)
    return result
  } catch (error) {
    console.error('Cloudinary get upload preset error:', error)
    throw new Error(`Get upload preset failed: ${error.message}`)
  }
}

/**
 * Generate video thumbnail
 * @param {string} publicId - Video public ID
 * @param {Object} options - Thumbnail options
 * @returns {string} Thumbnail URL
 */
function generateVideoThumbnail(publicId, options = {}) {
  const defaultOptions = {
    resource_type: 'video',
    format: 'jpg',
    quality: 'auto',
    ...options,
  }

  return cloudinary.url(publicId, defaultOptions)
}

module.exports = {
  uploadToCloudinary,
  uploadImage,
  uploadAvatar,
  deleteFromCloudinary,
  getOptimizedImageUrl,
  generateResponsiveUrls,
  uploadMultipleFiles,
  getFileInfo,
  searchFiles,
  createArchive,
  validateConfiguration,
  getUploadPreset,
  generateVideoThumbnail,
  cloudinary, // Export configured cloudinary instance
}