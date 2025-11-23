'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { buildApiUrl } from '@/config/api';

interface Credential {
  _id: string;
  credential_title: string;
  issuer_name: string;
  status: string;
  issued_date: string;
  verified_date?: string;
  nsqf_level?: number;
  description?: string;
  skill_tags: string[];
}

interface Profile {
  full_name: string;
  email: string;
  phone_number?: string;
  date_of_birth?: string;
  gender?: string;
  profile_picture_url?: string;
  bio?: string;
  education?: string;
  experience?: string;
  preferred_nsqf_level?: number;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    postal_code?: string;
  };
  location?: {
    city?: string;
    state?: string;
    country?: string;
  };
  skills?: string[];
  social_links?: {
    linkedin?: string;
    github?: string;
  };
  profile_completion?: number;
  kyc_verified?: boolean;
}

interface ShareInfo {
  access_count: number;
  expires_at?: string;
}

export default function SharedProfilePage() {
  const params = useParams();
  const userId = params.userId as string;
  const shareToken = params.shareToken as string;

  const [profile, setProfile] = useState<Profile | null>(null);
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [shareInfo, setShareInfo] = useState<ShareInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSharedProfile = async () => {
      try {
        const response = await fetch(buildApiUrl(`/learner/share/${userId}/${shareToken}`));

        if (!response.ok) {
          throw new Error('Failed to load shared profile');
        }

        const data = await response.json();
        setProfile(data.profile);
        setCredentials(data.credentials || []);
        setShareInfo(data.share_info);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (userId && shareToken) {
      fetchSharedProfile();
    }
  }, [userId, shareToken]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 className="mt-4 text-xl font-semibold text-gray-900">Profile Not Found</h2>
          <p className="mt-2 text-gray-600">{error || 'This shared link is invalid or has expired'}</p>
        </div>
      </div>
    );
  }

  // Get location info from address or location field
  const address = profile.address || {};
  const location = profile.location || {};
  const locationStr = address.city && address.state
    ? `${address.city}, ${address.state}, ${address.country || ''}`
    : [location.city, location.state, location.country].filter(Boolean).join(', ');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header Card */}
        <div className="bg-white shadow-xl rounded-2xl p-8 mb-6">
          <div className="text-center border-b border-gray-200 pb-6">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-3xl font-bold">
              {profile.full_name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{profile.full_name}</h1>
            
            {/* KYC Verification Badge */}
            {profile.kyc_verified && (
              <div className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium mb-3">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                KYC Verified
              </div>
            )}

            <div className="flex flex-wrap items-center justify-center gap-4 text-gray-600 text-sm">
              {profile.email && (
                <div className="flex items-center gap-1">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>{profile.email}</span>
                </div>
              )}
              {profile.phone_number && (
                <div className="flex items-center gap-1">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span>{profile.phone_number}</span>
                </div>
              )}
              {locationStr && (
                <div className="flex items-center gap-1">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{locationStr}</span>
                </div>
              )}
              {profile.date_of_birth && (
                <div className="flex items-center gap-1">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>{new Date(profile.date_of_birth).toLocaleDateString()}</span>
                </div>
              )}
              {profile.gender && (
                <div className="flex items-center gap-1">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="capitalize">{profile.gender}</span>
                </div>
              )}
            </div>
          </div>

          {/* Profile Stats */}
          <div className="mt-6 grid grid-cols-3 gap-4 text-center">
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{credentials.length}</div>
              <div className="text-sm text-gray-600">Credentials</div>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{profile.skills?.length || 0}</div>
              <div className="text-sm text-gray-600">Skills</div>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{profile.profile_completion || 0}%</div>
              <div className="text-sm text-gray-600">Profile Complete</div>
            </div>
          </div>
        </div>

        {/* Professional Summary */}
        {profile.bio && (
          <div className="bg-white shadow-lg rounded-2xl p-8 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Professional Summary
            </h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">{profile.bio}</p>
          </div>
        )}

        {/* Education */}
        {profile.education && (
          <div className="bg-white shadow-lg rounded-2xl p-8 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M12 14l9-5-9-5-9 5 9 5z" />
                <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
              </svg>
              Education
            </h2>
            <div className="text-gray-700 whitespace-pre-line">{profile.education}</div>
            {profile.preferred_nsqf_level && (
              <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                <span className="font-semibold">Preferred NSQF Level:</span>
                <span>{profile.preferred_nsqf_level}</span>
              </div>
            )}
          </div>
        )}

        {/* Experience */}
        {profile.experience && (
          <div className="bg-white shadow-lg rounded-2xl p-8 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Work Experience
            </h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">{profile.experience}</p>
          </div>
        )}

        {/* Address */}
        {profile.address && (profile.address.street || profile.address.city) && (
          <div className="bg-white shadow-lg rounded-2xl p-8 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Address
            </h2>
            <div className="text-gray-700 space-y-1">
              {profile.address.street && <div>{profile.address.street}</div>}
              <div>
                {[profile.address.city, profile.address.state, profile.address.postal_code]
                  .filter(Boolean)
                  .join(', ')}
              </div>
              {profile.address.country && <div>{profile.address.country}</div>}
            </div>
          </div>
        )}

        {/* Skills */}
        {profile.skills && profile.skills.length > 0 && (
          <div className="bg-white shadow-lg rounded-2xl p-8 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
              Skills
            </h2>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill, index) => (
                <span
                  key={index}
                  className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Credentials */}
        <div className="bg-white shadow-lg rounded-2xl p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Credentials & Certifications ({credentials.length})
          </h2>

          {credentials.length > 0 ? (
            <div className="space-y-4">
              {credentials.map((cred) => (
                <div
                  key={cred._id}
                  className="border-l-4 border-blue-600 bg-gray-50 p-6 rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-bold text-gray-900">{cred.credential_title}</h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                        cred.status === 'verified'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {cred.status}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-700">Issuer:</span>
                      <span>{cred.issuer_name}</span>
                    </div>

                    {cred.issued_date && (
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-700">Issued:</span>
                        <span>{new Date(cred.issued_date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                      </div>
                    )}

                    {cred.nsqf_level && (
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-700">NSQF Level:</span>
                        <span>{cred.nsqf_level}</span>
                      </div>
                    )}

                    {cred.description && (
                      <div className="mt-3">
                        <p className="text-gray-700">{cred.description}</p>
                      </div>
                    )}

                    {cred.skill_tags && cred.skill_tags.length > 0 && (
                      <div className="mt-3">
                        <span className="font-semibold text-gray-700">Skills: </span>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {cred.skill_tags.map((tag, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 text-center py-8">No credentials available</p>
          )}
        </div>

        {/* Social Links */}
        {(profile.social_links?.linkedin || profile.social_links?.github) && (
          <div className="bg-white shadow-lg rounded-2xl p-8 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              Links
            </h2>
            <div className="space-y-2">
              {profile.social_links.linkedin && (
                <a
                  href={profile.social_links.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
                >
                  <span className="font-semibold">LinkedIn:</span>
                  <span className="hover:underline">{profile.social_links.linkedin}</span>
                </a>
              )}
              {profile.social_links.github && (
                <a
                  href={profile.social_links.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
                >
                  <span className="font-semibold">GitHub:</span>
                  <span className="hover:underline">{profile.social_links.github}</span>
                </a>
              )}
            </div>
          </div>
        )}

        {/* Footer Info */}
        {shareInfo && (
          <div className="bg-white shadow-lg rounded-2xl p-6 text-center">
            <p className="text-sm text-gray-500">
              This profile has been viewed {shareInfo.access_count} time{shareInfo.access_count !== 1 ? 's' : ''}
              {shareInfo.expires_at && (
                <> • Expires on {new Date(shareInfo.expires_at).toLocaleDateString()}</>
              )}
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Generated by CredHub • Professional Credential Management Platform
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

