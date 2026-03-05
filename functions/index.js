const {initializeApp} = require("firebase-admin/app");
const {getAuth} = require("firebase-admin/auth");
const {onDocumentCreated} = require("firebase-functions/v2/firestore");

// Firebase Admin SDK'yı başlat
initializeApp();

// Admin email adresi
const ADMIN_EMAIL = "meoncu@gmail.com";

/**
 * Kullanıcı dokümanı oluştuğunda çalışır
 * Eğer email admin email ise, custom claims ve role ayarlar
 */
exports.setAdminRole = onDocumentCreated("users/{userId}", async (event) => {
  const userData = event.data.data();
  const userId = event.params.userId;

  console.log(`Yeni kullanıcı oluştu: ${userData.email} (UID: ${userId})`);

  // Admin email kontrolü
  if (userData.email === ADMIN_EMAIL) {
    try {
      // 1. Firebase Auth Custom Claims ekle (en güvenli yöntem)
      await getAuth().setCustomUserClaims(userId, {admin: true});
      console.log(`✅ Custom claims eklendi: ${userId}`);

      // 2. Firestore'da role alanını güncelle
      await event.data.ref.update({
        role: "admin",
        isAdmin: true,
        adminAssignedAt: new Date().toISOString(),
      });
      console.log(`✅ Firestore güncellendi: ${userId}`);

      // 3. Kullanıcıyı bilgilendir (opsiyonel - client'ta dinlenebilir)
      // Client'ta: onIdTokenChanged ile token yenilenince admin olduğunu anlar

    } catch (error) {
      console.error(`❌ Admin rolü atanırken hata:`, error);
      throw error;
    }
  } else {
    console.log(`ℹ️ Normal kullanıcı: ${userData.email}`);
  }
});

/**
 * Mevcut kullanıcıyı admin yapmak için HTTP function (tek seferlik kullanım)
 * Kullanım: firebase functions:call makeAdmin --data '{"email":"meoncu@gmail.com"}'
 */
exports.makeAdmin = require("firebase-functions/v2/https").onCall(
    async (request) => {
    // Sadece adminler başka kullanıcıları admin yapabilir
      const callerToken = request.auth?.token;

      if (!callerToken?.admin && request.data.email !== ADMIN_EMAIL) {
        throw new require("firebase-functions/v2/https").HttpsError(
            "permission-denied",
            "Bu işlem için admin yetkisi gerekiyor"
        );
      }

      try {
        const email = request.data.email;
        const user = await getAuth().getUserByEmail(email);

        // Custom claims ekle
        await getAuth().setCustomUserClaims(user.uid, {admin: true});

        // Firestore'u güncelle
        const {getFirestore} = require("firebase-admin/firestore");
        await getFirestore()
            .collection("users")
            .doc(user.uid)
            .update({
              role: "admin",
              isAdmin: true,
              adminAssignedAt: new Date().toISOString(),
            });

        console.log(`✅ ${email} admin yapıldı`);
        return {success: true, message: `${email} admin yapıldı`};
      } catch (error) {
        console.error("❌ Admin yapma hatası:", error);
        throw new require("firebase-functions/v2/https").HttpsError(
            "internal",
            error.message
        );
      }
    }
);
