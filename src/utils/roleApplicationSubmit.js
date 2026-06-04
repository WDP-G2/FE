import { roleApplicationService } from '@/services/roleApplicationService'

const REQUIRED_FILES = {
  OWNER: ['verificationDocument'],
  JOCKEY: ['licenseDocument'],
  REFEREE: ['certificationDocument'],
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

function assertRequiredFiles(role, files) {
  for (const key of REQUIRED_FILES[role] ?? []) {
    if (!files[key]) {
      throw new Error('Vui lòng chọn file bắt buộc trước khi gửi hồ sơ')
    }
  }
}

/** Gửi hồ sơ — file do BE upload lên Cloudinary */
export async function submitRoleApplication(role, { values, files, fileFieldNames }) {
  assertRequiredFiles(role, files)
  const textFields = pickTextFields(values, fileFieldNames)

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
    return roleApplicationService.submitOwner(
      {
        stableName: textFields.stableName,
        address: textFields.address,
        experienceYears: textFields.experienceYears,
        bio: textFields.bio,
      },
      files.verificationDocument,
    )
  }

  if (role === 'JOCKEY') {
    return roleApplicationService.submitJockey(
      {
        licenseNumber: textFields.licenseNumber,
        experienceYears: textFields.experienceYears,
        heightCm: textFields.heightCm,
        weightKg: textFields.weightKg,
        hirePrice: textFields.hirePrice,
        bio: textFields.bio,
        awards: textFields.awards,
        specialties: textFields.specialties,
      },
      {
        avatar: files.avatar,
        achievements: files.achievements,
        licenseDocument: files.licenseDocument,
      },
    )
  }

  return roleApplicationService.submitReferee(
    {
      licenseNumber: textFields.licenseNumber,
      experienceYears: textFields.experienceYears,
      specialty: textFields.specialty,
      bio: textFields.bio,
    },
    files.certificationDocument,
  )
}
