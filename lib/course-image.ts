const COURSE_IMAGES: Record<string, string> = {
  CS: 'https://www.bu.edu/online/files/2025/05/MS-Computer-Info_Networks_banner-1200x500.jpg',
  MATH: 'https://majorsdata.arizona.edu/sites/default/files/styles/az_trellis_800w_scale/public/2020-09/ua_science_mathematics_comprehensive_emphasis.jpg?itok=LeHM6XFn',
};

export function getCourseImage(code: string | null) {
  const prefix = code?.split(/[0-9]/)[0]?.toUpperCase() || '';
  if (COURSE_IMAGES[prefix]) return COURSE_IMAGES[prefix];
  return '/images/default-course.jpg';
}
