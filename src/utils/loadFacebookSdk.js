import { FACEBOOK_APP_ID } from '@/config/env'

let sdkPromise = null

export function loadFacebookSdk() {
  if (typeof window === 'undefined' || !FACEBOOK_APP_ID) {
    return Promise.reject(new Error('Facebook App ID chưa được cấu hình'))
  }

  if (window.FB) {
    return Promise.resolve()
  }

  if (!sdkPromise) {
    sdkPromise = new Promise((resolve, reject) => {
      window.fbAsyncInit = () => {
        window.FB.init({
          appId: FACEBOOK_APP_ID,
          cookie: true,
          xfbml: false,
          version: 'v19.0',
        })
        resolve()
      }

      const existing = document.getElementById('facebook-jssdk')
      if (existing) {
        existing.addEventListener('load', () => resolve())
        existing.addEventListener('error', reject)
        return
      }

      const script = document.createElement('script')
      script.id = 'facebook-jssdk'
      script.src = 'https://connect.facebook.net/vi_VN/sdk.js'
      script.async = true
      script.defer = true
      script.onerror = reject
      document.body.appendChild(script)
    })
  }

  return sdkPromise
}
