export type UserRole = 'user' | 'superadmin_1' | 'superadmin_2' | 'student' | 'admin_incharge' | 'admin_developer';

export type EducationType = 'B.Tech' | 'MBA' | 'BCA' | 'Other';

export interface UserProfile {
  id: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  email: string;
  phone: string;
  college_id?: string;
  college_name?: string;
  profile_image?: string;
  current_education?: EducationType;
  gender?: string;
  address?: string;
  avatar_url?: string;
  resume_url?: string;
  role: UserRole;
  password?: string;
  email_verified?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface EmailOtp {
  id: string;
  email: string;
  hashed_otp: string;
  purpose: 'registration' | 'forgot_password' | 'change_password';
  expires_at: string;
  attempt_count: number;
  created_at: string;
}

export interface Section {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  equipments: string[];
  section_head: string;
  section_head_title: string;
  image_url: string;
}

export interface TeamMember {
  name: string;
  role?: string;
  branch?: string;
  avatar?: string;
}

export interface Project {
  id: string;
  title: string;
  project_type?: 'individual' | 'team';
  status?: 'running' | 'completed' | 'upcoming';
  team_name?: string;
  description: string;
  full_detail?: string;
  leader_name: string;
  leader_branch?: string;
  leader_email?: string;
  leader_photo?: string;
  team_members: TeamMember[];
  cover_image: string;
  project_images?: string[];
  pdf_url?: string;
  pdf_name?: string;
  tech_stack: string[];
  created_at: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  caption?: string;
  image_url: string; // compatibility with existing code
  media_type?: 'photo' | 'video';
  media_url?: string;
  thumbnail_url?: string;
  category: string;
  created_at: string;
}

export interface ChapterMember {
  id: string;
  name: string;
  role: string;
  branch?: string;
  category?: 'leadership' | 'member';
  photo_url: string;
  linkedin_url?: string;
  bio?: string;
  display_order: number;
}

export interface Application {
  id: string;
  user_id: string;
  applicant_name?: string;
  applicant_email?: string;
  education?: string;
  type: string; // 'project', 'training', 'event'
  title: string;
  description?: string;
  abstract?: string;
  pdf_url?: string;
  status: 'pending' | 'approved' | 'rejected';
  incharge_message?: string;
  created_at: string;
  profiles?: UserProfile;
}

export interface NotificationItem {
  id: string;
  user_id?: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

export interface AppUpdate {
  id: string;
  title: string;
  content: string;
  tag: string;
  created_at: string;
}

export interface ContactDetails {
  email_primary: string;
  email_secondary?: string;
  phone_primary: string;
  phone_secondary?: string;
  address: string;
  instagram_handle?: string;
  instagram_url?: string;
  linkedin_handle?: string;
  linkedin_url?: string;
}

export interface FacultyMember {
  id: string;
  name: string;
  role: string;
  dept: string;
  photo_url?: string;
  display_order: number;
}

export interface LabInchargeProfile {
  name: string;
  title: string;
  badge?: string;
  message?: string;
  photo_url?: string;
}
