import { uploadRoleApplicationFile } from '@/services/cloudinaryService'
import { roleApplicationService } from '@/services/roleApplicationService'

const FILE_URL_FIELDS = {
  OWNER: { verificationDocument: 'verificationDocumentUrl' },
  JOCKEY: {
    avatar: 'avatarUrl',
    achievements: 'achievementsUrl',
    licenseDocument: 'licenseDocumentUrl',
  },
  REFEREE: { certificationDocument: 'certificationDocumentUrl' },
}

const REQUIRED_FILES = {
  OWNER: ['verificationDocument'],
  JOCKEY: ['licenseDocument'],
  REFEREE: ['certificationDocument'],
}

function assertRequiredFiles(role, files) {
  for (const key of REQUIRED_FILES[role] ?? []) {
    if (!files[key]) {
      throw new Error('Vui lòng chọn file bắt buộc trước khi gửi hồ sơ')
    }
  }
}

function pickTextFields(values, fileFieldNames) {
  const textFields = {}
  Object.entries(values).forEach(([key, value]) => {
    if (!fileFieldNames.has(key) && value !== '' && value != null) {
      textFields[key] = value
    }
  })
  return textFields
}

async function uploadRoleFiles(role, files) {
  const mapping = FILE_URL_FIELDS[role]
  if (!mapping) return {}

  const urls = {}
  await Promise.all(
    Object.entries(mapping).map(async ([fileKey, urlKey]) => {
      const file = files[fileKey]
      if (!file) return
      urls[urlKey] = await uploadRoleApplicationFile(file, role, fileKey)
    }),
  )
  return urls
}

export async function submitRoleApplication(role, { values, files, fileFieldNames }) {
  assertRequiredFiles(role, files)
  const textFields = pickTextFields(values, fileFieldNames)
  const uploadedUrls = await uploadRoleFiles(role, files)

  if (role === 'SPECTATOR') {
    return roleApplicationService.submitSpectator({
      displayName: textFields.displayName,
      phone: textFields.phone,
      location: textFields.location,
      favoriteHorseBreed: textFields.favoriteHorseBreed,
      bio: textFields.bio,
    })
  }

  if (role === 'OWNER') {
    return roleApplicationService.submitOwner({
      stableName: textFields.stableName,
      address: textFields.address,
      experienceYears: textFields.experienceYears,
      bio: textFields.bio,
      verificationDocumentUrl: uploadedUrls.verificationDocumentUrl,
    })
  }

  if (role === 'JOCKEY') {
    return roleApplicationService.submitJockey({
      licenseNumber: textFields.licenseNumber,
      experienceYears: textFields.experienceYears,
      heightCm: textFields.heightCm,
      weightKg: textFields.weightKg,
      hirePrice: textFields.hirePrice,
      bio: textFields.bio,
      awards: textFields.awards,
      specialties: textFields.specialties,
      avatarUrl: uploadedUrls.avatarUrl,
      achievementsUrl: uploadedUrls.achievementsUrl,
      licenseDocumentUrl: uploadedUrls.licenseDocumentUrl,
    })
  }

  return roleApplicationService.submitReferee({
    licenseNumber: textFields.licenseNumber,
    experienceYears: textFields.experienceYears,
    specialty: textFields.specialty,
    bio: textFields.bio,
    certificationDocumentUrl: uploadedUrls.certificationDocumentUrl,
  })
}
