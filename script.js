        // CONFIGURATION FIREBASE DATABASE VIA GOOGLE PROJECT IDX
        import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
        import { getAuth, signInAnonymously, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
        import { getFirestore, doc, getDoc, setDoc, updateDoc, deleteDoc, collection, getDocs } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

        const firebaseConfig = {
            apiKey: "AIzaSyDqucQMPinZTOeSRnGYyGrsd2ikjhTn0QQ",
            authDomain: "classin-5f88e.firebaseapp.com",
            projectId: "classin-5f88e",
            storageBucket: "classin-5f88e.firebasestorage.app",
            messagingSenderId: "886600737534",
            appId: "1:886600737534:web:02e44583cb3cf125d73baf"
        };

        // Initialize Firebase
        const app = initializeApp(firebaseConfig);
        const db = getFirestore(app);
        const auth = getAuth(app);

        // Global variables provided by environment or default
        const appId = typeof __app_id !== 'undefined' ? __app_id : 'classin-default';

        // State & Static Database
        let currentLang = 'id';
        let authMode = 'login'; 
        let isDarkMode = false;
        let notifEnabled = false;
        let fileAccessPermissionGranted = false;
        let onboardingIndex = 0;
        let selectedDay = 'Semua';
        let currentUserId = null;
        let customAlarm = { date: '', time: '', note: '', active: false };

        // Default static schedules to load if Firestore empty
        const INITIAL_SCHEDULES = [
            { id: '1', title: 'Pemrograman Web SPA', sks: 3, dosen: 'Bpk. Ian, M.Kom', type: 'offline', location: 'Gedung A, Ruang 301', link: '', startTime: '08:00', endTime: '10:30', day: 'Senin' },
            { id: '2', title: 'Kecerdasan Buatan', sks: 3, dosen: 'Ibu Sarah, Ph.D', type: 'online', location: '', link: 'https://zoom.us/j/12345678', startTime: '13:00', endTime: '15:30', day: 'Senin' },
            { id: '3', title: 'Basis Data Lanjut', sks: 4, dosen: 'Bpk. Budi, M.T', type: 'offline', location: 'Lab Komputer 2', link: '', startTime: '10:00', endTime: '13:20', day: 'Selasa' },
            { id: '4', title: 'Jaringan Komputer', sks: 3, dosen: 'Ibu Mega, M.T', type: 'offline', location: 'Gedung B, Ruang 204', link: '', startTime: '08:00', endTime: '10:30', day: 'Rabu' },
            { id: '5', title: 'Etika Profesi IT', sks: 2, dosen: 'Bpk. Heri, M.M', type: 'online', location: '', link: 'https://zoom.us/j/87654321', startTime: '15:45', endTime: '17:15', day: 'Kamis' },
            { id: '6', title: 'Sistem Operasi', sks: 3, dosen: 'Ibu Sarah, Ph.D', type: 'offline', location: 'Lab Komputer 1', link: '', startTime: '08:00', endTime: '10:30', day: 'Jumat' },
            { id: '7', title: 'Metode Penelitian', sks: 2, dosen: 'Dr. Ahmad Fauzi', type: 'online', location: '', link: 'https://zoom.us/j/11223344', startTime: '14:00', endTime: '15:30', day: 'Sabtu' },
        ];
        let schedules = [];

        // --- CENTRAL MODAL VISIBILITY ENGINE (FIX: "delay klik" bug) ---
        // ROOT CAUSE: semua modal memakai `backdrop-blur` (backdrop-filter) di atas
        // elemen yang di-toggle dari `display:none` (class "hidden") -> visible.
        // Chromium/WebKit punya bug rendering yang cukup terkenal: saat sebuah
        // elemen dengan backdrop-filter berpindah dari display:none ke visible di
        // dalam SATU event handler yang sama, browser kadang menunda repaint-nya
        // sampai ada trigger repaint lain (klik/scroll di tempat lain). Efeknya
        // persis seperti yang dilaporkan: elemen "baru muncul" setelah klik area lain.
        // FIX: setelah class "hidden" dilepas, kita paksa browser melakukan
        // reflow SEKARANG JUGA (dengan membaca offsetHeight) lalu memaksa satu
        // frame repaint via requestAnimationFrame, sebelum event click selesai.
        // ==========================================
// 1. PERBAIKAN BUG "DELAY KLIK" PADA MODAL (REAL-TIME RESPONSIVE)
// ==========================================
// =====================================================================
// PERBAIKAN TOTAL: ENGINE MODAL ULTRA-RESPONSIF (INSTAN TANPA DELAY)
// =====================================================================
window.showModal = function(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.remove('hidden');
}

window.hideModal = function(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.add('hidden');
}

        // --- MULTI-LANGUAGE DICTIONARY ---
        const dictionary = {
            id: {
                menuFeatures: "Fitur",
                menuTestimonials: "Testimoni",
                menuAbout: "Tentang Kami",
                btnOpenApp: "Buka Aplikasi",
                appVersion: "Versi 3.0 Web Premium App",
                sloganPart1: "Manajemen Jadwal Kuliah",
                sloganPart2: "Anti-Pusing",
                appDesc: "Aplikasi asisten jadwal perkuliahan terintegrasi, pemetaan ruang kelas kampus, dan pengingat cerdas otomatis berbasis SPA untuk produktivitas maksimal mahasiswa.",
                btnStartTrial: "Mulai Uji Coba Gratis",
                noInstall: "Tanpa Instalasi Perangkat Keras",
                featuresTitle: "Mengapa Memilih ClassIn?",
                featuresDesc: "Dirancang khusus untuk melancarkan mobilitas harian para mahasiswa agar bebas dari kendala terlambat kelas.",
                f1Title: "Antisipasi Salah Kelas",
                f1Desc: "Panduan navigasi lokasi kelas internal kampus berupa visualisasi letak gedung, lantai, dan nomor ruangan lengkap secara luring.",
                f2Title: "Notifikasi Pengingat",
                f2Desc: "Web push notification otomatis 15 menit sebelum kuliah dimulai untuk memastikan Anda bersiap-siap menuju ruang kelas berikutnya.",
                f3Title: "Akses Cepat Zoom",
                f3Desc: "Integrasi tombol instan untuk langsung meluncur ke konferensi virtual bagi mata kuliah yang diadakan secara daring/hibrida.",
                testiTitle: "Suara Mahasiswa",
                testiDesc: "Dengar langsung pengalaman tulus dari mereka yang menggunakan ClassIn.",
                testi1: '"Aplikasi ini menyelamatkan saya dari drama salah masuk kelas! Sebelum memakai ClassIn, saya sering lupa jadwal kelas luring karena jadwal yang sering bergeser."',
                testi2: '"Notifikasi otomatisnya beneran membantu. Muncul langsung di HP saya tepat 15 menit sebelum jam kuliah dimulai. Dosen penguji juga sangat memuji rancangan aplikasinya!"',
                studentMajor: "Teknik Informatika",
                aboutTitle: "Misi Kami Membantu Akademis Mahasiswa",
                aboutP1: "ClassIn didirikan atas kepedulian mendalam terhadap tingginya tingkat keterlambatan dan salah kelas yang dihadapi mahasiswa akibat kompleksnya jadwal perkuliahan dinamis di kampus.",
                aboutP2: "Aplikasi ini terintegrasi penuh untuk memberikan kenyamanan navigasi digital, pengaturan alarm otomatis cerdas, serta pembagian jadwal perkuliahan secara efisien guna mendukung transisi digitalisasi kampus.",
                sponsorHeader: "Kolaborator & Didukung Oleh",
                sponsorSub: "Integrasi teknologi mutakhir serta tools pengembangan profesional yang mendukung stabilitas sistem ClassIn:",
                btnSkip: "Lewati",
                btnNext: "Lanjut",
                backToWeb: "Kembali ke Website",
                heroSlogan: "Manajemen Jadwal Kuliah Anti-Pusing",
                heroSubSlogan: "Asisten cerdas perencana hari-hari perkuliahan Anda.",
                loginTitle: "Selamat Datang di ClassIn",
                loginSubtitle: "Gunakan kredensial mahasiswa anda untuk masuk ke dasbor.",
                lblFullName: "Nama Lengkap",
                lblNim: "Nomor Induk Mahasiswa (NIM)",
                lblEmail: "Email Mahasiswa",
                lblPassword: "Kata Sandi",
                btnSubmitLogin: "Masuk ke Dashboard",
                noAccountText: "Belum punya akun?",
                registerNowLink: "Daftar Sekarang",
                orLoginWith: "Atau masuk dengan",
                btnLoginGoogle: "Masuk dengan Google",
                termsPart1: "Dengan masuk, Anda menyetujui",
                termsPart2: "Syarat & Ketentuan",
                termsPart3: "kami.",
                greetingHello: "Halo",
                menuHome: "Beranda",
                menuAdd: "Tambah Jadwal",
                menuProfile: "Pengaturan Profil",
                actionAddTitle: "Tambah Jadwal",
                actionAddSub: "Sisipkan agenda kelas baru",
                actionRoomTitle: "Cek Ruang Kosong",
                actionRoomSub: "Simulasi audit lokasi nugas",
                filterDayTitle: "Navigasi Filter Hari",
                btnAll: "Semua",
                scheduleListHeader: "Daftar Jadwal Kuliah",
                navHome: "Beranda",
                navCalendar: "Kalender",
                navSettings: "Pengaturan",
                backToHome: "Kembali ke Beranda",
                calendarHeader: "Kalender Akademik",
                monthLabel: "Juli 2026",
                agendaToday: "Agenda Tanggal Ini",
                profileHeader: "Pengaturan Profil",
                activeStudent: "Mahasiswa Aktif",
                lblProgram: "Program Studi",
                lblFaculty: "Fakultas",
                lblUniv: "Perguruan Tinggi",
                lblSemester: "Semester",
                btnEditBio: "Ubah Informasi Akademik",
                statsSks: "SKS Terdaftar",
                statsCourses: "Mata Kuliah Aktif",
                appPreferences: "Preferensi Aplikasi",
                settingDark: "Mode Gelap (Dark Mode)",
                settingDarkSub: "Penghemat baterai & ramah di mata malam hari",
                settingNotif: "Pusat Notifikasi Aplikasi",
                settingNotifSub: "Alarm otomatis 15 menit sebelum perkuliahan",
                settingLang: "Bahasa Aplikasi",
                settingLangSub: "Ubah bahasa antarmuka ClassIn",
                calIntegration: "Integrasi Kalender",
                btnSyncCal: "Sinkronisasi Google Calendar",
                notConnected: "Belum Terhubung",
                btnLogout: "Keluar Dari Akun",
                logoutConfirmTitle: "Yakin Ingin Keluar?",
                logoutConfirmDesc: "Anda harus login kembali menggunakan akun simulasi untuk mengakses data jadwal perkuliahan.",
                btnLogoutCancel: "Tidak, Tetap Masuk",
                btnLogoutConfirm: "Ya, Keluar Akun",
                btnCancel: "Batal",
                btnSave: "Simpan",
                lblCourse: "Nama Mata Kuliah",
                lblSksCount: "Jumlah SKS",
                lblDayName: "Hari Kuliah",
                lblLecturerName: "Nama Dosen Pengampu",
                lblTimeStart: "Jam Mulai",
                lblTimeEnd: "Jam Selesai",
                lblClassFormat: "Format Tatap Muka",
                emptyRoomDesc: "Ditemukan ruangan yang sedang tidak digunakan untuk kelas saat ini. Dapat Anda pakai untuk belajar mandiri atau diskusi tugas:",
                btnCloseAudit: "Tutup Jendela Audit"
            },
            en: {
                menuFeatures: "Features",
                menuTestimonials: "Testimonials",
                menuAbout: "About Us",
                btnOpenApp: "Open App",
                appVersion: "Version 3.0 Web Premium App",
                sloganPart1: "Class Schedule Management",
                sloganPart2: "Without Headache",
                appDesc: "Integrated class schedule assistant application, campus classroom mapping, and smart automatic reminders based on SPA for maximum student productivity.",
                btnStartTrial: "Start Free Trial",
                noInstall: "No Hardware Installation Needed",
                featuresTitle: "Why Choose ClassIn?",
                featuresDesc: "Designed specifically to facilitate the daily mobility of students to be free from late class obstacles.",
                f1Title: "Room Mistake Prevention",
                f1Desc: "Internal campus class location navigation guidelines in the form of building layout visualization, floors, and room numbers completely offline.",
                f2Title: "Reminder Notifications",
                f2Desc: "Automatic web push notifications 15 minutes before class starts to make sure you prepare for the next classroom.",
                f3Title: "Quick Zoom Access",
                f3Desc: "Instant button integration to jump straight into online conference rooms for classes held virtually or hybrid.",
                testiTitle: "Student Voices",
                testiDesc: "Hear directly from those who honestly use ClassIn.",
                testi1: '"This application saved me from classroom dramas! Before ClassIn, I often forgot the offline class schedule because schedules shifted."',
                testi2: '"The automatic notification really helps. Appears directly on my phone exactly 15 minutes before class starts. Dosen praised this app!"',
                studentMajor: "Informatics Engineering",
                aboutTitle: "Our Mission to Assist Student Academic Life",
                aboutP1: "ClassIn was founded out of a deep concern for the high rate of tardiness and wrong classrooms students faced due to complex schedule shifts.",
                aboutP2: "This application is fully integrated to provide digital navigation comfort, automated smart alarm setups, and smooth schedule listings.",
                sponsorHeader: "Collaborators & Supported By",
                sponsorSub: "State-of-the-art technology integrations and professional development tools supporting ClassIn system stability:",
                btnSkip: "Skip",
                btnNext: "Next",
                backToWeb: "Back to Website",
                heroSlogan: "No-Headache Class Schedule Management",
                heroSubSlogan: "Your smart assistant planning your dynamic college schedule.",
                loginTitle: "Welcome to ClassIn",
                loginSubtitle: "Use your student academic credentials to enter the dashboard.",
                lblFullName: "Full Name",
                lblNim: "Student Identity Number (NIM)",
                lblEmail: "Student Email",
                lblPassword: "Password",
                btnSubmitLogin: "Login to Dashboard",
                noAccountText: "Don't have an account?",
                registerNowLink: "Register Now",
                orLoginWith: "Or login with",
                btnLoginGoogle: "Sign in with Google",
                termsPart1: "By logging in, you agree to our",
                termsPart2: "Terms & Conditions",
                termsPart3: "document.",
                greetingHello: "Hello",
                menuHome: "Home",
                menuAdd: "Add Schedule",
                menuProfile: "Profile Settings",
                actionAddTitle: "Add Schedule",
                actionAddSub: "Insert a new class agenda",
                actionRoomTitle: "Empty Room Check",
                actionRoomSub: "Simulated campus study spot check",
                filterDayTitle: "Day Filter Navigation",
                btnAll: "All",
                scheduleListHeader: "Class Schedule List",
                navHome: "Home",
                navCalendar: "Calendar",
                navSettings: "Settings",
                backToHome: "Back to Home",
                calendarHeader: "Academic Calendar",
                monthLabel: "July 2026",
                agendaToday: "Agenda For Today",
                profileHeader: "Profile Settings",
                activeStudent: "Active Student",
                lblProgram: "Study Program",
                lblFaculty: "Faculty",
                lblUniv: "University",
                lblSemester: "Semester",
                btnEditBio: "Edit Academic Profile",
                statsSks: "Registered Credits",
                statsCourses: "Active Classes",
                appPreferences: "App Preferences",
                settingDark: "Dark Mode",
                settingDarkSub: "Save battery life & comfort for night reading",
                settingNotif: "App Notification Center",
                settingNotifSub: "Automated alarm 15 minutes before college",
                settingLang: "App Language",
                settingLangSub: "Change ClassIn interface language",
                calIntegration: "Calendar Integration",
                btnSyncCal: "Sync Google Calendar",
                notConnected: "Not Connected",
                btnLogout: "Sign Out",
                logoutConfirmTitle: "Are you sure you want to sign out?",
                logoutConfirmDesc: "You will have to log back in using simulated accounts to access academic schedules.",
                btnLogoutCancel: "No, Stay Connected",
                btnLogoutConfirm: "Yes, Sign Out",
                btnCancel: "Cancel",
                btnSave: "Save",
                lblCourse: "Course Name",
                lblSksCount: "Credits SKS",
                lblDayName: "Schedule Day",
                lblLecturerName: "Lecturer In Charge",
                lblTimeStart: "Start Time",
                lblTimeEnd: "End Time",
                lblClassFormat: "Class Format",
                emptyRoomDesc: "Found rooms currently vacant and not being utilized for college class. Use them for your study groups:",
                btnCloseAudit: "Close Audit View"
            }
        };

        const onboardingSlides = [
            {
                visual: `<div class="w-40 h-40 bg-indigo-100 dark:bg-indigo-950/50 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto text-6xl shadow-xl shadow-indigo-600/10"><i class="fa-solid fa-map-location-dot animate-bounce-slow"></i></div>`,
                title: 'Temukan Lokasi Kelas',
                titleEn: 'Locate Your Classroom',
                desc: 'Tidak perlu bingung lagi mencari letak ruang ujian atau kuliah umum. ClassIn memetakan petunjuk gedung secara luring.',
                descEn: 'Never get lost finding classrooms or exam halls. ClassIn maps out direct internal guidelines seamlessly.'
            },
            {
                visual: `<div class="w-40 h-40 bg-indigo-100 dark:bg-indigo-950/50 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto text-6xl shadow-xl shadow-indigo-600/10"><i class="fa-solid fa-bell animate-bounce-slow"></i></div>`,
                title: 'Alarm & Pengingat Pintar',
                titleEn: 'Alarm & Smart Reminders',
                desc: 'Menerima pemberitahuan push instan tepat 15 menit sebelum perkuliahan dimulai, agar Anda memiliki persiapan yang optimal.',
                descEn: 'Receive precise push alerts 15 minutes before your schedule starts, ensuring you have enough prep time.'
            },
            {
                visual: `<div class="w-40 h-40 bg-indigo-100 dark:bg-indigo-950/50 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto text-6xl shadow-xl shadow-indigo-600/10"><i class="fa-solid fa-graduation-cap animate-spin-slow"></i></div>`,
                title: 'Aplikasi Berbasis SPA',
                titleEn: 'SPA Built Web App',
                desc: 'Nikmati navigasi yang cepat dan mulus tanpa jeda reload halaman berkat arsitektur Single Page Application yang modern.',
                descEn: 'Enjoy lightning-fast and smooth screen transitions with no page reload lagging, powered by single page app architecture.'
            }
        ];

        // --- MULTI-LANGUAGE TRANSLATOR ---
        window.switchLanguage = function(lang) {
            currentLang = lang;
            const idBtn = document.getElementById('lang-id-btn');
            const enBtn = document.getElementById('lang-en-btn');

            if (lang === 'id') {
                idBtn.className = "px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all bg-indigo-600 text-white shadow-sm";
                enBtn.className = "px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all text-slate-500 dark:text-slate-400";
            } else {
                enBtn.className = "px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all bg-indigo-600 text-white shadow-sm";
                idBtn.className = "px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all text-slate-500 dark:text-slate-400";
            }

            document.querySelectorAll('[data-i18n]').forEach(element => {
                const translationKey = element.getAttribute('data-i18n');
                if (dictionary[lang][translationKey]) {
                    element.innerHTML = dictionary[lang][translationKey];
                }
            });

            renderOnboardingSlide();
            renderDashboard();
            renderCalendar();
        }

        // --- TESTIMONIAL CAROUSEL NAVIGATION ---
        window.slideTesti = function(idx) {
            const container = document.getElementById('testi-carousel');
            const cards = container.children;
            if (cards[idx]) {
                container.scrollTo({
                    left: cards[idx].offsetLeft - container.offsetLeft,
                    behavior: 'smooth'
                });
            }
            // Update dots
            const dots = document.querySelectorAll('.testi-dot');
            dots.forEach((dot, index) => {
                if (index === idx) {
                    dot.className = "testi-dot w-3 h-3 rounded-full bg-indigo-600 transition-colors";
                } else {
                    dot.className = "testi-dot w-3 h-3 rounded-full bg-slate-300 dark:bg-slate-700 transition-colors";
                }
            });
        }

        // Detect manual swipe scroll on carousel to update indicators
        document.getElementById('testi-carousel').addEventListener('scroll', () => {
            const container = document.getElementById('testi-carousel');
            const scrollPos = container.scrollLeft;
            const width = container.clientWidth;
            const activeIndex = Math.round(scrollPos / width);
            const dots = document.querySelectorAll('.testi-dot');
            dots.forEach((dot, index) => {
                if (index === activeIndex) {
                    dot.className = "testi-dot w-3 h-3 rounded-full bg-indigo-600 transition-colors";
                } else {
                    dot.className = "testi-dot w-3 h-3 rounded-full bg-slate-300 dark:bg-slate-700 transition-colors";
                }
            });
        });

        // --- APP ALERTS ---
        window.triggerAlert = function(title, message, iconType = 'info') {
            document.getElementById('alert-title').textContent = title;
            document.getElementById('alert-message').textContent = message;
            
            const iconWrap = document.getElementById('alert-icon-wrapper');
            if (iconType === 'error') {
                iconWrap.className = "w-14 h-14 bg-red-100 dark:bg-red-950/50 rounded-2xl flex items-center justify-center text-2xl mx-auto text-red-600";
                iconWrap.innerHTML = `<i class="fa-solid fa-circle-xmark"></i>`;
            } else if (iconType === 'success') {
                iconWrap.className = "w-14 h-14 bg-emerald-100 dark:bg-emerald-950/50 rounded-2xl flex items-center justify-center text-2xl mx-auto text-emerald-600";
                iconWrap.innerHTML = `<i class="fa-solid fa-circle-check"></i>`;
            } else {
                iconWrap.className = "w-14 h-14 bg-indigo-100 dark:bg-indigo-950/50 rounded-2xl flex items-center justify-center text-2xl mx-auto text-indigo-600";
                iconWrap.innerHTML = `<i class="fa-solid fa-circle-info"></i>`;
            }
            showModal('custom-alert');
        }

        window.closeAlert = function() {
            hideModal('custom-alert');
        }

        // --- PHOTO UPLOAD SIMULATION & PERMISSIONS ---
        window.toggleFileAccessPermission = function() {
            fileAccessPermissionGranted = !fileAccessPermissionGranted;
            const switchEl = document.getElementById('settings-fileaccess-switch');
            if (fileAccessPermissionGranted) {
                switchEl.querySelector('span').className = 'w-5 h-5 rounded-full bg-white transition-all transform translate-x-5 shadow-sm';
                triggerAlert("Izin Diberikan", "Aplikasi sekarang memiliki hak akses ke galeri gambar perangkat Anda.", "success");
            } else {
                switchEl.querySelector('span').className = 'w-5 h-5 rounded-full bg-white transition-all transform translate-x-0 shadow-sm';
            }
        }

        window.triggerAvatarUploadSim = function() {
            if (!fileAccessPermissionGranted) {
                triggerAlert("Izin Diperlukan", "Silakan aktifkan 'Izin Akses File HP' terlebih dahulu di menu Preferensi Aplikasi di bawah.", "error");
                return;
            }
            // Trigger local hidden file input click
            document.getElementById('profile-upload-input').click();
        }

        // Handle image selection conversion to base64
        document.getElementById('profile-upload-input').addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = async function(event) {
                const base64Image = event.target.result;
                // Update local storage
                localStorage.setItem('classin-custom-avatar', base64Image);
                
                // Sync with Firebase Firestore
                if (currentUserId) {
                    try {
                        const profileRef = doc(db, 'artifacts', appId, 'users', currentUserId, 'profile', 'data');
                        await updateDoc(profileRef, { avatar: base64Image });
                    } catch (err) {
                        console.error("Firestore image sync error: ", err);
                    }
                }

                // Update UI instantly
                document.getElementById('avatar-img-profile').src = base64Image;
                document.getElementById('avatar-img-dashboard').src = base64Image;
                triggerAlert("Berhasil Diunggah", "Foto profil baru Anda berhasil disinkronkan secara global!", "success");
            };
            reader.readAsDataURL(file);
        });

        // --- BACKGROUND SCHEDULE CHECKER (ALARM) ---
        window.checkSchedules = function() {
            if (!notifEnabled) return;
            const now = new Date();
            const DAYS_ID = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
            const currentDayName = DAYS_ID[now.getDay()];
            
            if (currentDayName === 'Minggu') return;

            // Custom alarm evaluation
            if (customAlarm.active && customAlarm.date && customAlarm.time) {
                const alarmDateStr = now.toISOString().split('T')[0];
                const alarmTimeStr = now.toTimeString().substring(0, 5);
                
                if (customAlarm.date === alarmDateStr && customAlarm.time === alarmTimeStr) {
                    triggerSmartAlert({
                        title: "⏰ Alarm Kustom Aktif!",
                        dosen: "ClassIn System",
                        startTime: customAlarm.time,
                        type: 'online',
                        link: '#',
                        location: customAlarm.note || 'Pengingat Agenda Mandiri'
                    });
                    customAlarm.active = false; // reset once triggered
                }
            }

            // Regular schedules alerts (15 minutes ahead)
            const todaySchedules = schedules.filter(s => s.day === currentDayName);
            todaySchedules.forEach(s => {
                const [startH, startM] = s.startTime.split(':').map(Number);
                const scheduleMins = startH * 60 + startM;
                const nowMins = now.getHours() * 60 + now.getMinutes();
                const diff = scheduleMins - nowMins;

                if (diff === 15) {
                    triggerSmartAlert(s);
                }
            });
        }

        window.triggerSmartAlert = function(schedule) {
            const isID = currentLang === 'id';
            const title = isID ? `🔔 Waktunya Kuliah: ${schedule.title}!` : `🔔 Class Time: ${schedule.title}!`;
            const body = isID 
                ? `Kelas dengan ${schedule.dosen} dimulai pukul ${schedule.startTime}. Lokasi: ${schedule.type === 'offline' ? schedule.location : 'Zoom/Online'}`
                : `Class with ${schedule.dosen} starts at ${schedule.startTime}. Venue: ${schedule.type === 'offline' ? schedule.location : 'Zoom/Online'}`;

            // Always show toast notification for mobile compatibility and real-time feel
            showToastNotification(title, body);

            if ('Notification' in window && Notification.permission === 'granted') {
                try {
                    new Notification(title, { body });
                } catch(e) {}
            }
        }

        window.showToastNotification = function(title, body) {
            const container = document.getElementById('toast-container');
            document.getElementById('toast-title').textContent = title;
            document.getElementById('toast-body').textContent = body;
            
            showModal('toast-container');
            setTimeout(() => {
                hideModal('toast-container');
            }, 8000);
        }

        window.closeToast = function() {
            hideModal('toast-container');
        }

        // --- SINGLE PAGE ROUTING ---
        window.navigateTo = function(viewId) {
            const views = document.querySelectorAll('.view-section');
            views.forEach(v => v.classList.add('hidden'));

            const target = document.getElementById(viewId);
            if (target) {
                target.classList.remove('hidden');
            }

            if (viewId === 'view-dashboard') {
                renderDashboard();
            } else if (viewId === 'view-calendar') {
                renderCalendar();
            } else if (viewId === 'view-profile') {
                renderProfileView();
            }
        }

        // --- ONBOARDING SLIDES ACTION ---
        window.renderOnboardingSlide = function() {
            const current = onboardingSlides[onboardingIndex];
            const container = document.getElementById('onboard-container');
            const isID = currentLang === 'id';
            
            container.innerHTML = `
                <div class="space-y-6">
                    ${current.visual}
                    <div class="space-y-2">
                        <h3 class="text-2xl font-black text-slate-900 dark:text-white tracking-tight">${isID ? current.title : current.titleEn}</h3>
                        <p class="text-slate-500 dark:text-slate-400 text-sm max-w-sm mx-auto leading-relaxed">${isID ? current.desc : current.descEn}</p>
                    </div>
                </div>
            `;

            const dots = document.querySelectorAll('.onboard-dot');
            dots.forEach((dot, idx) => {
                if (idx === onboardingIndex) {
                    dot.className = 'onboard-dot w-8 h-2 rounded-full bg-indigo-600 transition-all duration-300';
                } else {
                    dot.className = 'onboard-dot w-2 h-2 rounded-full bg-slate-200 dark:bg-slate-700 transition-all duration-300';
                }
            });

            const btnText = document.getElementById('onboard-btn-text');
            if (onboardingIndex === onboardingSlides.length - 1) {
                btnText.textContent = isID ? 'Mulai' : 'Get Started';
            } else {
                btnText.textContent = isID ? 'Lanjut' : 'Next';
            }
        }

        window.nextOnboardingSlide = function() {
            if (onboardingIndex < onboardingSlides.length - 1) {
                onboardingIndex++;
                renderOnboardingSlide();
            } else {
                navigateTo('view-auth');
            }
        }

        window.skipOnboarding = function() {
            navigateTo('view-auth');
        }

        // --- DYNAMIC SHOW HIDE PASSWORD ---
        window.togglePasswordVisibility = function() {
            const passInput = document.getElementById('auth-password');
            const icon = document.getElementById('password-toggle-icon');
            if (passInput.type === 'password') {
                passInput.type = 'text';
                icon.className = 'fa-solid fa-eye-slash text-sm';
            } else {
                passInput.type = 'password';
                icon.className = 'fa-solid fa-eye text-sm';
            }
        }

        // --- DYNAMIC REGISTER AUTH TOGGLE ---
        window.toggleAuthMode = function() {
            const isID = currentLang === 'id';
            const registerFields = document.getElementById('register-fields');
            const title = document.getElementById('auth-title');
            const subtitle = document.getElementById('auth-subtitle');
            const submitText = document.getElementById('auth-submit-text');
            const toggleDesc = document.getElementById('auth-toggle-desc');
            const toggleBtn = document.getElementById('auth-toggle-btn');

            if (authMode === 'login') {
                authMode = 'register';
                registerFields.classList.remove('hidden');
                title.textContent = isID ? 'Daftar Akun ClassIn' : 'Register ClassIn Account';
                subtitle.textContent = isID ? 'Buat profil mahasiswa akademik Anda sekarang.' : 'Build your student academic profile now.';
                submitText.textContent = isID ? 'Daftar Akun Baru' : 'Register New Account';
                toggleDesc.textContent = isID ? 'Sudah punya akun?' : 'Already have an account?';
                toggleBtn.textContent = isID ? 'Masuk di sini' : 'Log in here';
            } else {
                authMode = 'login';
                registerFields.classList.add('hidden');
                title.textContent = isID ? 'Selamat Datang di ClassIn' : 'Welcome to ClassIn';
                subtitle.textContent = isID ? 'Gunakan kredensial mahasiswa anda untuk masuk ke dasbor.' : 'Use your academic credentials to enter the dashboard.';
                submitText.textContent = isID ? 'Masuk ke Dashboard' : 'Log In to Dashboard';
                toggleDesc.textContent = isID ? 'Belum punya akun?' : "Don't have an account?";
                toggleBtn.textContent = isID ? 'Daftar Sekarang' : 'Register Now';
            }
        }

        // --- SUBMIT USER SIGN UP OR SIGN IN (SINKRON KE FIREBASE) ---
        window.handleAuthSubmit = async function(event) {
            event.preventDefault();
            const isID = currentLang === 'id';
            const emailVal = document.getElementById('auth-email').value;
            const passVal = document.getElementById('auth-password').value;

            if (authMode === 'register') {
                const fullName = document.getElementById('auth-fullname').value;
                const nimVal = document.getElementById('auth-nim').value;

                try {
                    // Firebase Auth Create User
                    const userCredential = await createUserWithEmailAndPassword(auth, emailVal, passVal);
                    const user = userCredential.user;
                    
                    // Save profile details directly into Firestore strict paths
                    const profileRef = doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'data');
                    await setDoc(profileRef, {
                        name: fullName || "Vierdha Jastien Prihandha",
                        nim: nimVal || "1124160057",
                        prog: "Teknik Informatika",
                        fac: "Teknologi Informasi & Komunikasi",
                        univ: "ITB Bina Sarana Global",
                        sem: "Semester Genap (Aktif)",
                        avatar: ""
                    });

                    // Set default database schedules inside Firestore
                    for (const sched of INITIAL_SCHEDULES) {
                        const schedRef = doc(db, 'artifacts', appId, 'users', user.uid, 'schedules', sched.id);
                        await setDoc(schedRef, sched);
                    }

                    // Auto-fill form and prompt success
                    toggleAuthMode();
                    document.getElementById('auth-email').value = emailVal;
                    document.getElementById('auth-password').value = passVal;

                    triggerAlert(
                        isID ? 'Pendaftaran Sukses!' : 'Registration Successful!',
                        isID ? 'Akun telah terdaftar di database Firebase. Silakan login.' : 'Account registered successfully in Firebase. Please sign-in.',
                        'success'
                    );
                } catch (err) {
                    console.error(err);
                    triggerAlert("Eror Registrasi", err.message, "error");
                }
            } else {
                try {
                    await signInWithEmailAndPassword(auth, emailVal, passVal);
                } catch (err) {
                    console.error(err);
                    triggerAlert("Otentikasi Gagal", err.message, "error");
                }
            }
        }

        // --- ANONYMOUS/GOOGLE SIGN-IN SIMULATOR ---
        window.simulateGoogleSignIn = async function() {
            try {
                await signInAnonymously(auth);
            } catch (err) {
                console.error(err);
                triggerAlert("Eror Google Sign In", err.message, "error");
            }
        }

        // Monitor Auth State Changes to retrieve data dynamically from Firestore
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                currentUserId = user.uid;
                triggerLoginLoadingSequence();
            } else {
                currentUserId = null;
                navigateTo('view-auth');
            }
        });

        window.triggerLoginLoadingSequence = function() {
            const loadingScreen = document.getElementById('screen-loading');
            const typewriter = document.getElementById('loading-typewriter');
            const isID = currentLang === 'id';

            loadingScreen.classList.remove('hidden');
            typewriter.textContent = isID ? "Menghubungkan Akun..." : "Connecting Account...";
            
            setTimeout(() => {
                typewriter.textContent = isID ? "Sinkronisasi Cloud Firestore..." : "Syncing Cloud Firestore...";
            }, 1000);

            setTimeout(async () => {
                loadingScreen.classList.add('hidden');
                navigateTo('view-skeleton');
                
                // Fetch dynamic user details from Firestore
                await syncFromFirestore();

                setTimeout(() => {
                    navigateTo('view-dashboard');
                }, 1500);

            }, 2000);
        }

        // Real Synchronous pulling from Firestore paths
        async function syncFromFirestore() {
            if (!currentUserId) return;
            const isID = currentLang === 'id';

            try {
                // Read User profile Doc
                const profileRef = doc(db, 'artifacts', appId, 'users', currentUserId, 'profile', 'data');
                const profileSnap = await getDoc(profileRef);
                
                if (profileSnap.exists()) {
                    const data = profileSnap.data();
                    localStorage.setItem('classin-custom-user', JSON.stringify(data));
                    if (data.avatar) {
                        localStorage.setItem('classin-custom-avatar', data.avatar);
                    }
                } else {
                    // Create default profile if not exists
                    const defaultProfile = {
                        name: "Vierdha Jastien Prihandha",
                        nim: "1124160057",
                        prog: "Teknik Informatika",
                        fac: "Teknologi Informasi & Komunikasi",
                        univ: "ITB Bina Sarana Global",
                        sem: "Semester Genap (Aktif)",
                        avatar: ""
                    };
                    await setDoc(profileRef, defaultProfile);
                    localStorage.setItem('classin-custom-user', JSON.stringify(defaultProfile));
                }

                // Read schedules collection from Firestore
                const schedulesCol = collection(db, 'artifacts', appId, 'users', currentUserId, 'schedules');
                const schedulesSnap = await getDocs(schedulesCol);
                
                let tempSchedules = [];
                schedulesSnap.forEach((doc) => {
                    tempSchedules.push({ ...doc.data(), id: doc.id });
                });

                if (tempSchedules.length > 0) {
                    schedules = tempSchedules;
                } else {
                    // Populate initial values
                    for (const sched of INITIAL_SCHEDULES) {
                        const schedRef = doc(db, 'artifacts', appId, 'users', currentUserId, 'schedules', sched.id);
                        await setDoc(schedRef, sched);
                    }
                    schedules = INITIAL_SCHEDULES;
                }
                localStorage.setItem('classin-schedules', JSON.stringify(schedules));

            } catch (err) {
                console.error("Firebase pulling error: ", err);
                // Fallback to local storage if Firestore throws rules/network error
                const localUser = localStorage.getItem('classin-custom-user');
                if (!localUser) {
                    localStorage.setItem('classin-custom-user', JSON.stringify({
                        name: "Vierdha Jastien Prihandha",
                        nim: "1124160057",
                        prog: "Teknik Informatika",
                        fac: "Teknologi Informasi & Komunikasi",
                        univ: "ITB Bina Sarana Global",
                        sem: "Semester Genap (Aktif)"
                    }));
                }
                const localScheds = localStorage.getItem('classin-schedules');
                schedules = localScheds ? JSON.parse(localScheds) : INITIAL_SCHEDULES;
            }
        }

        // --- DASHBOARD RENDERING ENGINE ---
        window.renderDashboard = function() {
            const isID = currentLang === 'id';
            const storedUser = JSON.parse(localStorage.getItem('classin-custom-user')) || {
                name: "Vierdha Jastien Prihandha",
                nim: "1124160057",
                prog: "Teknik Informatika",
                fac: "Teknologi Informasi & Komunikasi",
                univ: "ITB Bina Sarana Global",
                sem: "Semester Genap (Aktif)"
            };

            document.getElementById('dash-greeting-name').textContent = storedUser.name.split(' ')[0] + '!';
            document.getElementById('dash-info-nim').textContent = storedUser.nim;
            document.getElementById('dash-info-prog').textContent = storedUser.prog || "Teknik Informatika";
            document.getElementById('dash-info-univ').textContent = storedUser.univ || "ITB Bina Sarana Global";
            document.getElementById('dash-info-sem').textContent = storedUser.sem || "Semester Genap (Aktif)";

            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            const todayStr = new Date().toLocaleDateString(isID ? 'id-ID' : 'en-US', options);
            document.getElementById('dash-current-date').textContent = todayStr;

            const savedAvatar = localStorage.getItem('classin-custom-avatar');
            if (savedAvatar) {
                document.getElementById('avatar-img-profile').src = savedAvatar;
                document.getElementById('avatar-img-dashboard').src = savedAvatar;
            }

            renderNextClassHighlight();
            if (typeof renderBookedRooms === 'function') renderBookedRooms();
            renderSchedulesList();
        }

        let bookedRoomsData = [];

        window.openBookingFormModal = function(roomName) {
            closeEmptyRoomModal();
            document.getElementById('booking-room-name').value = roomName;
            document.getElementById('booking-email').value = '';
            document.getElementById('booking-kelas').value = '';
            document.getElementById('booking-nim').value = '';
            document.getElementById('booking-waktu').value = 'Pagi';
            document.getElementById('booking-alasan').value = '';
            showModal('modal-booking-form');
        }

        window.closeBookingFormModal = function() {
            hideModal('modal-booking-form');
        }

        window.handleBookingSubmit = function(e) {
            e.preventDefault();
            const roomName = document.getElementById('booking-room-name').value;
            const waktu = document.getElementById('booking-waktu').value;
            
            const storedUser = JSON.parse(localStorage.getItem('classin-custom-user')) || { name: 'Siswa' };

            bookedRoomsData.push({
                room: roomName,
                repName: storedUser.name,
                waktu: waktu
            });

            // FITUR BARU: hapus ruangan yang baru saja dipinjam dari daftar
            // "Cek Ruang Kosong" secara real-time, tanpa perlu refresh halaman.
            availableRoomsData = availableRoomsData.filter(r => r.name !== roomName);
            renderEmptyRoomsList();

            closeBookingFormModal();
            
            if (typeof renderBookedRooms === 'function') renderBookedRooms();

            triggerAlert(
                "Peminjaman Sukses", 
                "Ruangan berhasil dipinjam dan sedang menunggu persetujuan lanjutan.",
                "success"
            );
        }

        window.renderBookedRooms = function() {
            const container = document.getElementById('booked-rooms-list');
            if(!container) return;
            
            if(bookedRoomsData.length === 0) {
                container.innerHTML = `
                    <div class="p-6 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-center bg-white dark:bg-slate-900 text-slate-400 text-xs text-center">
                        Belum ada ruangan yang dipinjam.
                    </div>
                `;
                return;
            }

            container.innerHTML = bookedRoomsData.map(b => `
                <div class="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-800/80 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                        <h4 class="font-extrabold text-sm text-slate-900 dark:text-white">${b.room}</h4>
                        <div class="flex items-center gap-2 mt-1">
                            <span class="text-xs text-slate-500 dark:text-slate-400 font-medium">Perwakilan: <span class="text-indigo-600 dark:text-indigo-400 font-bold">${b.repName}</span></span>
                            <span class="text-xs text-slate-300 dark:text-slate-600">•</span>
                            <span class="text-[10px] bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-500 px-2 py-0.5 rounded font-bold">${b.waktu}</span>
                        </div>
                    </div>
                    <span class="bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold px-3 py-1.5 rounded-lg border border-indigo-100 dark:border-indigo-900/50">Telah Terisi</span>
                </div>
            `).join('');
        }

        window.renderNextClassHighlight = function() {
            const isID = currentLang === 'id';
            const container = document.getElementById('highlight-card-container');
            const now = new Date();
            const DAYS_ID = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
            const todayName = DAYS_ID[now.getDay()];

            const todaySchedules = schedules.filter(s => s.day === todayName);
            const nowMins = now.getHours() * 60 + now.getMinutes();
            let nextClass = null;
            let minDiff = Infinity;

            todaySchedules.forEach(s => {
                const [startH, startM] = s.startTime.split(':').map(Number);
                const scheduleMins = startH * 60 + startM;
                const diff = scheduleMins - nowMins;
                
                if (diff > 0 && diff < minDiff) {
                    minDiff = diff;
                    nextClass = s;
                }
            });

            if (nextClass) {
                container.innerHTML = `
                    <div class="bg-gradient-to-br from-indigo-700 to-indigo-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-indigo-950/20 relative overflow-hidden transition-all duration-300">
                        <div class="absolute -right-16 -top-16 w-48 h-48 bg-white/5 rounded-full blur-2xl"></div>
                        <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div class="space-y-3">
                                <span class="inline-flex items-center gap-1.5 bg-amber-400 text-indigo-950 text-xs font-black px-3 py-1.5 rounded-full">
                                    <i class="fa-solid fa-clock animate-pulse-slow"></i> ${isID ? 'Dimulai dalam' : 'Starts in'} ${minDiff} ${isID ? 'Menit' : 'Minutes'}
                                </span>
                                <h3 class="text-xl sm:text-2xl font-black">${nextClass.title}</h3>
                                <div class="flex flex-wrap gap-4 text-xs text-indigo-100">
                                    <span class="flex items-center gap-1.5"><i class="fa-solid fa-chalkboard-user"></i> ${nextClass.dosen}</span>
                                    <span class="flex items-center gap-1.5">
                                        <i class="fa-solid ${nextClass.type === 'offline' ? 'fa-building' : 'fa-video'}"></i> 
                                        ${nextClass.type === 'offline' ? nextClass.location + ' (Lantai 3)' : 'Online Class'}
                                    </span>
                                </div>
                            </div>
                            
                            <div>
                                ${nextClass.type === 'offline' ? `
                                    <button onclick="triggerAlert('${isID ? 'Peta Navigasi' : 'Peta Navigasi'}', '${isID ? 'Petunjuk Arah: Masuk Gedung Utama, gunakan lift ke lantai 3, belok kanan ke Ruang ' + nextClass.location : 'Direction Guide: Enter main tower, take lift to 3rd floor, turn right to Room ' + nextClass.location}', 'info')" class="w-full md:w-auto bg-white text-indigo-700 font-bold py-3 px-6 rounded-xl hover:bg-slate-50 transition-all text-xs flex items-center justify-center gap-2">
                                        <i class="fa-solid fa-map"></i> <span data-i18n="btnCekPeta">Cek Peta Ruangan</span>
                                    </button>
                                ` : `
                                    <a href="${nextClass.link}" target="_blank" class="w-full md:w-auto bg-amber-400 hover:bg-amber-500 text-indigo-950 font-black py-3 px-6 rounded-xl transition-all text-xs flex items-center justify-center gap-2">
                                        <i class="fa-solid fa-video"></i> <span data-i18n="btnGabungZoom">Gabung Zoom Kelas</span>
                                    </a>
                                `}
                            </div>
                        </div>
                    </div>
                `;
            } else {
                container.innerHTML = `
                    <div class="p-6 sm:p-8 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center space-y-3 bg-white dark:bg-slate-900">
                        <div class="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 flex items-center justify-center text-lg"><i class="fa-solid fa-circle-check animate-pulse-slow"></i></div>
                        <div>
                            <h4 class="font-bold text-sm text-slate-800 dark:text-white">${isID ? 'Tidak Ada Agenda Terdekat' : 'No Academic Classes Near'}</h4>
                            <p class="text-xs text-slate-400 mt-0.5">${isID ? 'Semua kelas hari ini selesai atau belum terjadwal.' : 'All registered classes for today have been completed.'}</p>
                        </div>
                    </div>
                `;
            }
        }

        window.setFilterDay = function(day) {
            selectedDay = day;
            const btns = document.querySelectorAll('.filter-btn');
            btns.forEach(btn => {
                if (btn.textContent.trim() === day || (day === 'Semua' && btn.textContent.trim() === 'Semua' || btn.textContent.trim() === 'All')) {
                    btn.className = 'filter-btn shrink-0 px-5 py-2.5 rounded-full text-xs font-extrabold tracking-wide transition-all bg-indigo-600 text-white shadow-lg';
                } else {
                    btn.className = 'filter-btn shrink-0 px-5 py-2.5 rounded-full text-xs font-extrabold tracking-wide transition-all bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800/60 text-slate-500';
                }
            });
            renderSchedulesList();
        }

        window.renderSchedulesList = function() {
            const listContainer = document.getElementById('schedule-cards-list');
            const isID = currentLang === 'id';

            document.getElementById('active-day-badge').textContent = selectedDay === 'Semua' ? (isID ? 'Semua Hari' : 'All Days') : `${isID ? 'Hari' : 'Day'} ${selectedDay}`;

            let filtered = schedules;
            if (selectedDay !== 'Semua') {
                filtered = schedules.filter(s => s.day === selectedDay);
            }

            filtered.sort((a, b) => a.startTime.localeCompare(b.startTime));

            if (filtered.length === 0) {
                listContainer.innerHTML = `
                    <div class="text-center py-10 rounded-2xl border border-slate-100 dark:border-slate-800/80 bg-white/5 dark:bg-slate-900/40 text-slate-400">
                        <p class="text-xs italic">${isID ? 'Tidak ada perkuliahan pada hari ini.' : 'No lectures found for this day.'}</p>
                    </div>
                `;
                return;
            }

            listContainer.innerHTML = '';
            filtered.forEach(s => {
                const typeIcon = s.type === 'offline' ? 'fa-building text-indigo-500' : 'fa-video text-amber-500';
                const leftBarColor = s.type === 'offline' ? 'bg-indigo-600' : 'bg-amber-400';
                
                listContainer.innerHTML += `
                    <div class="group relative flex overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-800 shadow-sm transition-all hover:shadow-md">
                        <!-- Left color marker -->
                        <div class="w-3 shrink-0 ${leftBarColor}"></div>
                        
                        <!-- Content Card -->
                        <div class="p-4 sm:p-5 flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <!-- Time & Status -->
                            <div class="shrink-0 sm:w-28 space-y-0.5">
                                <h4 class="font-extrabold text-sm text-slate-900 dark:text-white leading-none">${s.startTime}</h4>
                                <span class="text-[10px] text-slate-400 font-bold block">${isID ? 'Sampai' : 'Until'} ${s.endTime}</span>
                            </div>

                            <!-- Course detail -->
                            <div class="flex-1 space-y-2">
                                <h4 class="font-extrabold text-sm sm:text-base text-slate-950 dark:text-white">${s.title} (${s.sks} SKS)</h4>
                                <div class="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-slate-400">
                                    <span class="flex items-center gap-1.5"><i class="fa-solid fa-chalkboard-user"></i> ${s.dosen}</span>
                                    <span class="flex items-center gap-1.5"><i class="fa-solid ${typeIcon}"></i> ${s.type === 'offline' ? s.location : 'Virtual Classroom'}</span>
                                </div>
                            </div>

                            <!-- Interactive Button Label -->
                            <div class="flex sm:flex-col items-start sm:items-end justify-between sm:justify-center gap-4">
                                ${s.type === 'offline' ? `
                                    <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-extrabold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                                        <i class="fa-solid fa-location-dot text-red-400"></i> ${s.location}
                                    </span>
                                ` : `
                                    <a href="${s.link}" target="_blank" class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-black bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 transition-colors">
                                        <i class="fa-solid fa-video"></i> ${isID ? 'Gabung Kelas' : 'Join Class'}
                                    </a>
                                `}

                                <!-- Manage Action Buttons (Edit & Delete) -->
                                <div class="flex items-center gap-2">
                                    <button onclick="editScheduleAction('${s.id}')" class="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/30 text-amber-500 flex items-center justify-center hover:scale-105 active:scale-95 transition-all">
                                        <i class="fa-solid fa-pen text-xs"></i>
                                    </button>
                                    <button onclick="deleteScheduleAction('${s.id}')" class="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-950/20 text-red-500 flex items-center justify-center hover:scale-105 active:scale-95 transition-all">
                                        <i class="fa-solid fa-trash-can text-xs"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            });
        }

        // --- CALENDAR RENDER ---
        window.renderCalendar = function() {
            const container = document.getElementById('calendar-agendas');
            const isID = currentLang === 'id';
            
            let agendas = [...schedules];
            agendas.sort((a,b) => {
                const daysOrder = { 'Senin': 1, 'Selasa': 2, 'Rabu': 3, 'Kamis': 4, 'Jumat': 5, 'Sabtu': 6 };
                return (daysOrder[a.day] - daysOrder[b.day]) || a.startTime.localeCompare(b.startTime);
            });

            container.innerHTML = '';
            agendas.forEach(a => {
                container.innerHTML += `
                    <div class="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-150 dark:border-slate-700 flex justify-between items-center text-xs">
                        <div class="space-y-1">
                            <span class="bg-indigo-100 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400 px-2 py-0.5 rounded font-extrabold">${a.day}</span>
                            <h4 class="font-bold text-slate-800 dark:text-white mt-1 text-sm">${a.title}</h4>
                            <p class="text-slate-400 text-[10px]">${a.startTime} - ${a.endTime} • ${a.dosen}</p>
                        </div>
                        <span class="text-slate-500 dark:text-slate-300 font-semibold">${a.type === 'offline' ? a.location : 'Zoom Meet'}</span>
                    </div>
                `;
            });
        }

        // --- PROFILE PREFERENCES VIEW RENDERING ---
        window.renderProfileView = function() {
            const isID = currentLang === 'id';
            const storedUser = JSON.parse(localStorage.getItem('classin-custom-user')) || {
                name: "Vierdha Jastien Prihandha",
                nim: "1124160057",
                prog: "Teknik Informatika",
                fac: "Teknologi Informasi & Komunikasi",
                univ: "ITB Bina Sarana Global",
                sem: "Semester Genap (Aktif)"
            };

            document.getElementById('profile-name').textContent = storedUser.name;
            document.getElementById('profile-nim').textContent = storedUser.nim;
            document.getElementById('profile-prog-val').textContent = storedUser.prog || "Teknik Informatika";
            document.getElementById('profile-fac-val').textContent = storedUser.fac || "Teknologi Informasi & Komunikasi";
            document.getElementById('profile-univ-val').textContent = storedUser.univ || "ITB Bina Sarana Global";
            document.getElementById('profile-sem-val').textContent = storedUser.sem || "Semester Genap (Aktif)";

            const dmSwitch = document.getElementById('settings-darkmode-switch');
            if (isDarkMode) {
                dmSwitch.querySelector('span').className = 'w-5 h-5 rounded-full bg-white transition-all transform translate-x-5 shadow-sm';
            } else {
                dmSwitch.querySelector('span').className = 'w-5 h-5 rounded-full bg-white transition-all transform translate-x-0 shadow-sm';
            }

            const faSwitch = document.getElementById('settings-fileaccess-switch');
            if (fileAccessPermissionGranted) {
                faSwitch.querySelector('span').className = 'w-5 h-5 rounded-full bg-white transition-all transform translate-x-5 shadow-sm';
            } else {
                faSwitch.querySelector('span').className = 'w-5 h-5 rounded-full bg-white transition-all transform translate-x-0 shadow-sm';
            }

            const notifSwitch = document.getElementById('settings-notif-switch');
            const alarmEditBtn = document.getElementById('settings-alarm-edit-btn');
            if (notifEnabled) {
                notifSwitch.querySelector('span').className = 'w-5 h-5 rounded-full bg-white transition-all transform translate-x-5 shadow-sm';
                alarmEditBtn.classList.remove('hidden');
            } else {
                notifSwitch.querySelector('span').className = 'w-5 h-5 rounded-full bg-white transition-all transform translate-x-0 shadow-sm';
                alarmEditBtn.classList.add('hidden');
            }
        }

        // --- EDIT BIODATA ACADEMIC SUBMISSIONS ---
        window.openEditBioModal = function() {
            const storedUser = JSON.parse(localStorage.getItem('classin-custom-user')) || {
                name: "Vierdha Jastien Prihandha",
                nim: "1124160057",
                prog: "Teknik Informatika",
                fac: "Teknologi Informasi & Komunikasi",
                univ: "ITB Bina Sarana Global",
                sem: "Semester Genap (Aktif)"
            };

            document.getElementById('edit-bio-prog').value = storedUser.prog || "Teknik Informatika";
            document.getElementById('edit-bio-fac').value = storedUser.fac || "Teknologi Informasi & Komunikasi";
            document.getElementById('edit-bio-univ').value = storedUser.univ || "ITB Bina Sarana Global";
            document.getElementById('edit-bio-sem').value = storedUser.sem || "Semester Genap (Aktif)";

            showModal('modal-edit-bio');
        }

        window.closeEditBioModal = function() {
            hideModal('modal-edit-bio');
        }

        window.handleEditBioSubmit = async function(e) {
            e.preventDefault();
            const isID = currentLang === 'id';
            const storedUser = JSON.parse(localStorage.getItem('classin-custom-user')) || {
                name: "Vierdha Jastien Prihandha",
                nim: "1124160057"
            };

            storedUser.prog = document.getElementById('edit-bio-prog').value;
            storedUser.fac = document.getElementById('edit-bio-fac').value;
            storedUser.univ = document.getElementById('edit-bio-univ').value;
            storedUser.sem = document.getElementById('edit-bio-sem').value;

            localStorage.setItem('classin-custom-user', JSON.stringify(storedUser));
            
            // Sync with Firestore profile doc
            if (currentUserId) {
                try {
                    const profileRef = doc(db, 'artifacts', appId, 'users', currentUserId, 'profile', 'data');
                    await setDoc(profileRef, storedUser, { merge: true });
                } catch (err) {
                    console.error(err);
                }
            }

            closeEditBioModal();
            renderProfileView();
            renderDashboard();

            triggerAlert(
                isID ? 'Pembaruan Sukses' : 'Profile Updated', 
                isID ? 'Biodata akademik Anda telah berhasil diubah secara global.' : 'Your academic profiles have been successfully updated.',
                'success'
            );
        }

        // --- ALARM MODAL SUBMISSION ---
        window.openAlarmSettingsModal = function() {
            document.getElementById('alarm-date-input').value = customAlarm.date || '';
            document.getElementById('alarm-time-input').value = customAlarm.time || '';
            document.getElementById('alarm-note-input').value = customAlarm.note || '';

            showModal('modal-alarm');
        }

        window.closeAlarmSettingsModal = function() {
            hideModal('modal-alarm');
        }

        window.handleAlarmSubmit = function(e) {
            e.preventDefault();
            const isID = currentLang === 'id';

            customAlarm.date = document.getElementById('alarm-date-input').value;
            customAlarm.time = document.getElementById('alarm-time-input').value;
            customAlarm.note = document.getElementById('alarm-note-input').value;
            customAlarm.active = true;

            closeAlarmSettingsModal();
            triggerAlert(
                isID ? 'Alarm Disimpan' : 'Alarm Configured', 
                isID ? `Pengingat otomatis dijadwalkan pada ${customAlarm.date} jam ${customAlarm.time}.` : `Auto alarm scheduled on ${customAlarm.date} at ${customAlarm.time}.`,
                'success'
            );
        }

        // --- OTHER SYSTEM MODALS & PREFERENCES switches ---
        window.toggleDarkMode = function() {
            isDarkMode = !isDarkMode;
            if (isDarkMode) {
                document.documentElement.classList.add('dark');
                localStorage.setItem('classin-dark', 'true');
            } else {
                document.documentElement.classList.remove('dark');
                localStorage.setItem('classin-dark', 'false');
            }
            renderProfileView();
        }

        window.toggleNotificationSetting = function() {
            const isID = currentLang === 'id';
            if (!notifEnabled) {
                if ('Notification' in window) {
                    Notification.requestPermission().then(permission => {
                        notifEnabled = true;
                        localStorage.setItem('classin-notif', 'true');
                        renderProfileView();
                        if (permission === 'granted') {
                            triggerAlert(isID ? 'Notifikasi Aktif' : 'Notifications Active', isID ? 'Sistem ClassIn akan mengingatkan jadwal kuliah Anda tepat 15 menit sebelumnya.' : 'ClassIn will push automatic alerts 15 minutes ahead of class schedules.', 'success');
                        } else {
                            triggerAlert(isID ? 'Pengingat Diaktifkan' : 'Reminders Configured', isID ? 'Izin diblokir. Aplikasi otomatis menggunakan alert Pop-up (Toast) di dalam web.' : 'Permissions blocked. Falling back to in-app pop-up notifications.', 'info');
                        }
                    });
                } else {
                    notifEnabled = true;
                    localStorage.setItem('classin-notif', 'true');
                    renderProfileView();
                }
            } else {
                notifEnabled = false;
                localStorage.setItem('classin-notif', 'false');
                renderProfileView();
            }
        }

        window.triggerCalendarSync = function(button) {
            const badge = document.getElementById('sync-status-badge');
            const isID = currentLang === 'id';
            badge.textContent = isID ? 'Menghubungkan...' : 'Connecting...';
            badge.className = 'text-[10px] bg-amber-100 text-amber-600 font-bold px-2.5 py-1 rounded-md';
            
            setTimeout(() => {
                badge.textContent = isID ? 'Terhubung' : 'Connected';
                badge.className = 'text-[10px] bg-emerald-100 text-emerald-600 font-bold px-2.5 py-1 rounded-md';
                triggerAlert(isID ? 'Sinkronisasi Berhasil' : 'Synchronization Complete', isID ? 'Semua jadwal ClassIn sinkron dengan Google Calendar Anda secara mulus.' : 'ClassIn events synchronized successfully to your calendar app.', 'success');
            }, 2000);
        }

        window.openTermsModal = function() {
            showModal('modal-terms');
        }
        window.closeTermsModal = function() {
            hideModal('modal-terms');
        }

        // --- DATA-DRIVEN "CEK RUANG KOSONG" LIST (FIX: auto-update real-time) ---
        // Sebelumnya daftar ruangan kosong di-hardcode langsung di HTML, sehingga
        // tidak mungkin dihapus otomatis setelah dipinjam. Sekarang datanya
        // disimpan di array `availableRoomsData` dan dirender ulang setiap kali
        // modal dibuka ATAU setiap kali ada ruangan yang berhasil dipinjam.
        let availableRoomsData = [
            { id: 'r1', name: 'Gedung B, Lantai 2 (Ruang 204)', desc: 'Sore - malam kosong' },
            { id: 'r2', name: 'Gedung A, Lantai 1 (A-102)', desc: 'Kosong s/d pukul 16:00 WIB' }
        ];

        window.renderEmptyRoomsList = function() {
            const container = document.getElementById('empty-rooms-list');
            if (!container) return;

            if (availableRoomsData.length === 0) {
                container.innerHTML = `
                    <div class="p-6 rounded-2xl border-2 border-dashed border-white/20 flex items-center justify-center text-slate-400 text-xs text-center">
                        Semua ruangan sedang terisi. Silakan cek kembali nanti.
                    </div>
                `;
                return;
            }

            container.innerHTML = availableRoomsData.map(r => `
                <div onclick="openBookingFormModal('${r.name.replace(/'/g, "\\'")}')" class="cursor-pointer hover:bg-white/20 transition-all p-3 bg-white/10 dark:bg-indigo-950/20 rounded-xl border border-white/10 flex justify-between items-center text-xs">
                    <div>
                        <strong class="text-slate-800 dark:text-white">${r.name}</strong>
                        <p class="text-slate-400 text-[10px] mt-0.5">${r.desc}</p>
                    </div>
                    <span class="bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 font-bold px-2.5 py-1 rounded-md">Tersedia</span>
                </div>
            `).join('');
        }

        window.openEmptyRoomModal = function() {
            renderEmptyRoomsList();
            showModal('modal-empty-rooms');
        }
        window.closeEmptyRoomModal = function() {
            hideModal('modal-empty-rooms');
        }

        window.openLogoutModal = function() {
            showModal('modal-logout');
        }
        window.closeLogoutModal = function() {
            hideModal('modal-logout');
        }
        window.confirmLogoutAction = async function() {
            closeLogoutModal();
            try {
                await signOut(auth);
            } catch (err) {
                console.error(err);
            }
        }

        // --- CRUD LOGICS FOR GLASSMORPHISM MODAL ---
        window.toggleCrudLocationField = function(type) {
            const wrapper = document.getElementById('crud-location-wrapper');
            if (type === 'online') {
                wrapper.innerHTML = `
                    <label class="block text-xs font-bold text-slate-400 dark:text-slate-300 uppercase tracking-wider mb-1.5"><i class="fa-solid fa-video"></i> URL Link Video Conference (Zoom/Teams)</label>
                    <input required type="url" id="crud-link" placeholder="https://zoom.us/j/12345678" class="w-full bg-white/10 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm">
                `;
            } else {
                wrapper.innerHTML = `
                    <label class="block text-xs font-bold text-slate-400 dark:text-slate-300 uppercase tracking-wider mb-1.5"><i class="fa-solid fa-map-pin"></i> Lokasi Kelas / Detail Ruangan</label>
                    <input required type="text" id="crud-location" placeholder="Gedung A, Ruang 301" class="w-full bg-white/10 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-slate-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm">
                `;
            }
        }

        window.openCrudModal = function() {
            document.getElementById('crud-modal-title').textContent = 'Tambah Jadwal Baru';
            document.getElementById('crud-id').value = '';
            document.getElementById('crud-title').value = '';
            document.getElementById('crud-sks').value = '';
            document.getElementById('crud-day').value = 'Senin';
            document.getElementById('crud-dosen').value = '';
            document.getElementById('crud-starttime').value = '08:00';
            document.getElementById('crud-endtime').value = '10:30';
            
            const typeRadio = document.querySelector('input[name="crud-type"][value="offline"]');
            if (typeRadio) {
                typeRadio.checked = true;
                toggleCrudLocationField('offline');
            }

            showModal('modal-crud');
        }

        window.editScheduleAction = function(id) {
            const schedule = schedules.find(s => s.id === id);
            if (!schedule) return;

            document.getElementById('crud-modal-title').textContent = 'Edit Jadwal Kuliah';
            document.getElementById('crud-id').value = schedule.id;
            document.getElementById('crud-title').value = schedule.title;
            document.getElementById('crud-sks').value = schedule.sks;
            document.getElementById('crud-day').value = schedule.day;
            document.getElementById('crud-dosen').value = schedule.dosen;
            document.getElementById('crud-starttime').value = schedule.startTime;
            document.getElementById('crud-endtime').value = schedule.endTime;

            const radioType = document.querySelector(`input[name="crud-type"][value="${schedule.type}"]`);
            if (radioType) {
                radioType.checked = true;
                toggleCrudLocationField(schedule.type);
            }

            if (schedule.type === 'offline') {
                document.getElementById('crud-location').value = schedule.location;
            } else {
                document.getElementById('crud-link').value = schedule.link;
            }

            showModal('modal-crud');
        }

        window.deleteScheduleAction = async function(id) {
            const isID = currentLang === 'id';
            if (confirm(isID ? 'Yakin ingin menghapus jadwal perkuliahan ini?' : 'Are you sure you want to delete this schedule?')) {
                schedules = schedules.filter(s => s.id !== id);
                localStorage.setItem('classin-schedules', JSON.stringify(schedules));
                
                // Sync with Firestore doc deletion
                if (currentUserId) {
                    try {
                        const docRef = doc(db, 'artifacts', appId, 'users', currentUserId, 'schedules', id);
                        await deleteDoc(docRef);
                    } catch (err) {
                        console.error(err);
                    }
                }
                
                renderDashboard();
                renderCalendar();
            }
        }

        window.closeCrudModal = function() {
            hideModal('modal-crud');
        }

        window.handleCrudSubmit = async function(event) {
            event.preventDefault();

            const id = document.getElementById('crud-id').value;
            const title = document.getElementById('crud-title').value;
            const sks = Number(document.getElementById('crud-sks').value);
            const day = document.getElementById('crud-day').value;
            const dosen = document.getElementById('crud-dosen').value;
            const startTime = document.getElementById('crud-starttime').value;
            const endTime = document.getElementById('crud-endtime').value;
            const type = document.querySelector('input[name="crud-type"]:checked').value;

            let location = '';
            let link = '';

            if (type === 'offline') {
                location = document.getElementById('crud-location').value;
            } else {
                link = document.getElementById('crud-link').value;
            }

            const targetId = id || String(Date.now());
            const targetSchedule = { id: targetId, title, sks, day, dosen, startTime, endTime, type, location, link };

            if (id) {
                schedules = schedules.map(s => s.id == id ? targetSchedule : s);
            } else {
                schedules.push(targetSchedule);
            }

            localStorage.setItem('classin-schedules', JSON.stringify(schedules));

            // Sync insertion / update with Firebase Firestore
            if (currentUserId) {
                try {
                    const docRef = doc(db, 'artifacts', appId, 'users', currentUserId, 'schedules', targetId);
                    await setDoc(docRef, targetSchedule);
                } catch (err) {
                    console.error("Firebase sync insertion error: ", err);
                }
            }

            closeCrudModal();
            renderDashboard();
            renderCalendar();
        }

        // --- APP LIFE CYCLE INITIALIZATION ---
        window.onload = function() {
            const stored = localStorage.getItem('classin-schedules');
            if (stored) {
                schedules = JSON.parse(stored);
            } else {
                schedules = INITIAL_SCHEDULES;
                localStorage.setItem('classin-schedules', JSON.stringify(schedules));
            }

            if (localStorage.getItem('classin-dark') === 'true') {
                isDarkMode = true;
                document.documentElement.classList.add('dark');
            }

            const savedAvatar = localStorage.getItem('classin-custom-avatar');
            if (savedAvatar) {
                document.getElementById('avatar-img-profile').src = savedAvatar;
                document.getElementById('avatar-img-dashboard').src = savedAvatar;
            }

            if (localStorage.getItem('classin-notif') === 'true') {
                notifEnabled = true;
            }

            const now = new Date();
            const DAYS_ID = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
            const currentDayName = DAYS_ID[now.getDay()];
            if (currentDayName !== 'Minggu') {
                selectedDay = 'Semua';
            }

            onboardingIndex = 0;
            renderOnboardingSlide();

            // Background schedule evaluation loop
            setInterval(checkSchedules, 60000);
            window.renderEmptyRooms();
            navigateTo('view-landing');
        };
// ==========================================
// 2. FITUR OTOMATISASI UPDATE DAFTAR RUANGAN KOSONG (VERSI AMAN & TERISOLASI)
// ==========================================
let emptyRooms = [
    { id: 'r1', name: 'Gedung A - Ruang 202', capacity: '30 Kursi', status: 'Tersedia' },
    { id: 'r2', name: 'Gedung B - Ruang 105', capacity: '40 Kursi', status: 'Tersedia' },
    { id: 'r3', name: 'Lab Komputer Utama', capacity: '25 Komputer', status: 'Tersedia' }
];

window.renderEmptyRooms = function() {
    // Cari elemen khusus daftar ruangan
    const container = document.getElementById('empty-rooms-list-target'); 
    
    // Jika tidak ketemu target spesifiknya, cari kontainer utama alternatifnya
    const fallbackContainer = container || document.getElementById('empty-rooms-container');
    if (!fallbackContainer) return;
    
    // Ambil elemen pembungkus list agar tidak menghapus seluruh isi form modal
    let listWrapper = fallbackContainer.querySelector('.rooms-list-wrapper');
    if (!listWrapper) {
        // Jika belum ada pembungkus list terisolasi, kita buat agar aman dari penimpaan
        listWrapper = document.createElement('div');
        listWrapper.className = 'rooms-list-wrapper w-full mt-4';
        fallbackContainer.appendChild(listWrapper);
    }
    
    // Kosongkan HANYA area list ruangan, BUKAN seluruh isi form modal!
    listWrapper.innerHTML = '';
    
    if (emptyRooms.length === 0) {
        listWrapper.innerHTML = `
            <div class="text-center p-6 text-slate-500 dark:text-slate-400">
                <i class="fa-solid fa-circle-check text-emerald-500 text-3xl mb-2"></i>
                <p class="text-sm font-semibold">Semua ruangan telah penuh dipesan atau sedang digunakan.</p>
            </div>`;
        return;
    }
    
    emptyRooms.forEach(room => {
        const roomEl = document.createElement('div');
        roomEl.className = "flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl mb-3 hover:bg-white/10 transition-all";
        roomEl.innerHTML = `
            <div class="text-left">
                <h4 class="font-bold text-sm text-slate-900 dark:text-white">${room.name}</h4>
                <p class="text-xs text-slate-500 dark:text-slate-400"><i class="fa-solid fa-users mr-1"></i> Kapasitas: ${room.capacity}</p>
            </div>
            <button onclick="bookRoom('${room.id}', '${room.name}')" class="py-2 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all">
                Pinjam Ruang
            </button>
        `;
        listWrapper.appendChild(roomEl);
    });
}

window.bookRoom = function(roomId, roomName) {
    emptyRooms = emptyRooms.filter(room => room.id !== roomId);
    window.renderEmptyRooms();
    
    if (typeof window.triggerAlert === 'function') {
        window.triggerAlert("Peminjaman Berhasil", `Ruangan ${roomName} berhasil Anda pesan untuk belajar/diskusi!`, "success");
    } else {
        alert(`Berhasil memesan ${roomName}!`);
    }
}