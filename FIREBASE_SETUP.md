# Firebase Kurulum ve Admin Yapılandırma

## Cloud Functions Kurulumu

### 1. Firebase CLI Yükleme

```bash
npm install -g firebase-tools
```

### 2. Firebase Login

```bash
firebase login
```

### 3. Firebase Projeyi Bağlama

```bash
firebase use --add
# sunnet-bc658 projesini seç
```

### 4. Functions Deploy

```bash
cd functions
npm install
firebase deploy --only functions
```

## Admin Kullanıcı Yapılandırması

### Otomatik Yöntem (Önerilen)

1. Cloud Functions deploy edildikten sonra
2. `meoncu@gmail.com` ile uygulamaya giriş yap
3. Otomatik olarak admin rolü atanacak

### Manuel Yöntem (Eğer otomatik çalışmazsa)

```bash
# makeAdmin fonksiyonunu çağır
firebase functions:call makeAdmin --data '{"email":"meoncu@gmail.com"}'
```

### Firestore Rules Güncelleme

```bash
firebase deploy --only firestore:rules
```

## Nasıl Çalışır?

1. **Kullanıcı giriş yaptığında**: `setAdminRole` Cloud Function çalışır
2. **Email kontrolü**: `meoncu@gmail.com` mu diye bakar
3. **Custom Claims**: Firebase Auth token'a `admin: true` ekler
4. **Firestore güncelleme**: `users/{uid}` dokümanına `role: "admin"` yazar
5. **Client güncelleme**: AuthContext token'dan admin claim'ini okur

## Güvenlik

- Custom Claims sadece server-side (Cloud Function) ile atanabilir
- Client'tan değiştirilemez
- Token'da yer aldığı için güvenlidir
- Firestore Rules'da `request.auth.token.admin == true` ile kontrol edilebilir
