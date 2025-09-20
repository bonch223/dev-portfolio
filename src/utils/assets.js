// Asset imports for Vite
// This ensures all assets are properly bundled and accessible in production

// Guro.AI Assets (WebP optimized)
import guroImg1 from '/src/assets/webp/guro.ai/536270183_24671247665820897_5850011110701414279_n.webp'
import guroImg2 from '/src/assets/webp/guro.ai/536279927_24671248132487517_3002615940259727901_n.webp'
import guroImg3 from '/src/assets/webp/guro.ai/540621977_24671253052487025_4440463990289559173_n.webp'
import guroVideo from '/src/assets/guro.ai/Guro.AI - AI Lesson Plan Generator for Filipino Teachers.mp4'

// SkillFoundri Assets (WebP optimized)
import skillFoundri1 from '/src/assets/webp/SkillFoundri/1.webp'
import skillFoundri2 from '/src/assets/webp/SkillFoundri/2.webp'
import skillFoundri3 from '/src/assets/webp/SkillFoundri/3.webp'

// Rage Fitness Assets (WebP optimized)
import rage1 from '/src/assets/webp/rage/1.webp'
import rage2 from '/src/assets/webp/rage/2.webp'
import rage3 from '/src/assets/webp/rage/3.webp'

// UrbanCare Assets (WebP optimized)
import urbanCare1 from '/src/assets/webp/urbancare/1.webp'
import urbanCare2 from '/src/assets/webp/urbancare/2.webp'
import urbanCare3 from '/src/assets/webp/urbancare/3.webp'

// Fantastic Baby Shakalaka Assets (WebP optimized)
import fantasticBaby1 from '/src/assets/webp/fantasticbabyshakala/1.webp'
import fantasticBaby2 from '/src/assets/webp/fantasticbabyshakala/2.webp'
import fantasticBaby3 from '/src/assets/webp/fantasticbabyshakala/3.webp'

// Website Creation Assets (WebP optimized)
import decorMeadow from '/src/assets/webp/Websites Created and Maintained/decormeadow.webp'
import femmeFits from '/src/assets/webp/Websites Created and Maintained/femmefits.webp'
import gentsDen from '/src/assets/webp/Websites Created and Maintained/gentsden.webp'
import plushPendants from '/src/assets/webp/Websites Created and Maintained/plushpendants.webp'
import starletStyle from '/src/assets/webp/Websites Created and Maintained/starletstyle.webp'
import cebuFirst from '/src/assets/webp/Websites Created and Maintained/Cebufirst.webp'
import cebuLandMasters from '/src/assets/webp/Websites Created and Maintained/cebulandmasters.webp'

// Company Assets (WebP optimized)
import armetLimited from '/src/assets/Companies/ArmetLimited.svg'
import atci from '/src/assets/webp/Companies/ATCI.webp'
import whiteHat from '/src/assets/webp/Companies/WhiteHat.webp'
import travelingCalifornian from '/src/assets/webp/Companies/TravelingCalifornian.webp'
import skillfoundriLogo from '/src/assets/webp/Companies/skillfoundri.webp'

// Social Media Assets (WebP optimized)
import socMed1 from '/src/assets/webp/SocMed/1.webp'
import socMed6 from '/src/assets/webp/SocMed/6.webp'
import socMed7 from '/src/assets/webp/SocMed/7.webp'

// Print Materials Assets (WebP optimized)
import print8 from '/src/assets/webp/printed materials/8.webp'
import print9 from '/src/assets/webp/printed materials/9.webp'
import print10 from '/src/assets/webp/printed materials/10.webp'
import print11 from '/src/assets/webp/printed materials/11.webp'
import print12 from '/src/assets/webp/printed materials/12.webp'

// SEO Assets (WebP optimized)
import seoBefore from '/src/assets/webp/SEO/seo-before.webp'
import seoAfter from '/src/assets/webp/SEO/seo-after.webp'

// Profile Assets
import profilePhoto from '/src/assets/Pro-photo.png'

// Export asset objects for easy access
export const projectAssets = {
  guro: {
    images: [guroImg1, guroImg2, guroImg3],
    video: guroVideo,
    main: guroImg1
  },
  skillFoundri: {
    images: [skillFoundri1, skillFoundri2, skillFoundri3],
    main: skillFoundri1
  },
  rage: {
    images: [rage1, rage2, rage3],
    main: rage1
  },
  urbanCare: {
    images: [urbanCare1, urbanCare2, urbanCare3],
    main: urbanCare1
  },
  fantasticBaby: {
    images: [fantasticBaby1, fantasticBaby2, fantasticBaby3],
    main: fantasticBaby1
  }
}

export const websiteAssets = {
  decorMeadow,
  femmeFits,
  gentsDen,
  plushPendants,
  starletStyle,
  cebuFirst,
  cebuLandMasters
}

export const companyAssets = {
  armetLimited,
  atci,
  whiteHat,
  travelingCalifornian,
  skillfoundriLogo
}

export const socialMediaAssets = [socMed1, socMed6, socMed7]

export const printMaterialsAssets = [print8, print9, print10, print11, print12]

export const seoAssets = [seoBefore, seoAfter]

export const profileAssets = {
  photo: profilePhoto
}
