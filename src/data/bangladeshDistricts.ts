export interface DivisionData {
  id: string;
  name: string;
  nameBn: string;
  deliveryFee: number;
  estimatedDelivery: string;
  districts: { id: string; name: string; nameBn: string; popularThanas: string[] }[];
}

export const BANGLADESH_DIVISIONS: DivisionData[] = [
  {
    id: 'dhaka',
    name: 'Dhaka Division',
    nameBn: 'ঢাকা বিভাগ',
    deliveryFee: 60,
    estimatedDelivery: '24 – 48 Hours',
    districts: [
      { id: 'dhaka-city', name: 'Dhaka (Metro & Suburbs)', nameBn: 'ঢাকা', popularThanas: ['Dhanmondi', 'Gulshan', 'Banani', 'Uttara', 'Mirpur', 'Mohammadpur', 'Badda', 'Motijheel', 'Old Dhaka'] },
      { id: 'gazipur', name: 'Gazipur', nameBn: 'গাজীপুর', popularThanas: ['Gazipur Sadar', 'Tongi', 'Kaliakair', 'Kapasia', 'Sreepur'] },
      { id: 'narayanganj', name: 'Narayanganj', nameBn: 'নারায়ণগঞ্জ', popularThanas: ['Narayanganj Sadar', 'Bandar', 'Rupganj', 'Sonargaon', 'Araihazar'] },
      { id: 'tangail', name: 'Tangail', nameBn: 'টাঙ্গাইল', popularThanas: ['Tangail Sadar', 'Mirzapur', 'Madhupur', 'Ghatail', 'Gopalpur'] },
      { id: 'kishoreganj', name: 'Kishoreganj', nameBn: 'কিশোরগঞ্জ', popularThanas: ['Kishoreganj Sadar', 'Bhairab', 'Bajitpur', 'Katiadi'] },
      { id: 'manikganj', name: 'Manikganj', nameBn: 'মানিকগঞ্জ', popularThanas: ['Manikganj Sadar', 'Singair', 'Saturia', 'Ghior'] },
      { id: 'munshiganj', name: 'Munshiganj', nameBn: 'মুন্সীগঞ্জ', popularThanas: ['Munshiganj Sadar', 'Sreenagar', 'Sirajdikhan', 'Lohajang'] },
      { id: 'narsingdi', name: 'Narsingdi', nameBn: 'নরসিংদী', popularThanas: ['Narsingdi Sadar', 'Palash', 'Shibpur', 'Raipura', 'Belabo'] },
      { id: 'faridpur', name: 'Faridpur', nameBn: 'ফরিদপুর', popularThanas: ['Faridpur Sadar', 'Boalmari', 'Bhanga', 'Madhukhali'] },
      { id: 'gopalganj', name: 'Gopalganj', nameBn: 'গোপালগঞ্জ', popularThanas: ['Gopalganj Sadar', 'Kashiani', 'Kotalipara', 'Tungipara'] },
      { id: 'madaripur', name: 'Madaripur', nameBn: 'মাদারীপুর', popularThanas: ['Madaripur Sadar', 'Shibchar', 'Kalkini', 'Rajoir'] },
      { id: 'rajbari', name: 'Rajbari', nameBn: 'রাজবাড়ী', popularThanas: ['Rajbari Sadar', 'Goalanda', 'Pangsha', 'Baliakandi'] },
      { id: 'shariatpur', name: 'Shariatpur', nameBn: 'শরীয়তপুর', popularThanas: ['Shariatpur Sadar', 'Naria', 'Zajira', 'Damudya'] }
    ]
  },
  {
    id: 'chattogram',
    name: 'Chattogram Division',
    nameBn: 'চট্টগ্রাম বিভাগ',
    deliveryFee: 120,
    estimatedDelivery: '2 – 3 Days',
    districts: [
      { id: 'chattogram-metro', name: 'Chattogram', nameBn: 'চট্টগ্রাম', popularThanas: ['Panchlaish', 'Kotwali', 'Khulshi', 'Halishahar', 'Agrabad', 'Patenga', 'Hathazari'] },
      { id: 'coxsbazar', name: 'Cox\'s Bazar', nameBn: 'কক্সবাজার', popularThanas: ['Sadar', 'Ramu', 'Chakaria', 'Teknaf', 'Ukhia'] },
      { id: 'cumilla', name: 'Cumilla', nameBn: 'কুমিল্লা', popularThanas: ['Cumilla Adarsha Sadar', 'Laksam', 'Daudkandi', 'Chandina', 'Burichang'] },
      { id: 'feni', name: 'Feni', nameBn: 'ফেনী', popularThanas: ['Feni Sadar', 'Chhagalnaiya', 'Daganbhuiyan', 'Parshuram'] },
      { id: 'brahmanbaria', name: 'Brahmanbaria', nameBn: 'ব্রাহ্মণবাড়িয়া', popularThanas: ['Sadar', 'Ashuganj', 'Kasba', 'Nabinagar', 'Sarail'] },
      { id: 'noakhali', name: 'Noakhali', nameBn: 'নোয়াখালী', popularThanas: ['Sudharam', 'Begumganj', 'Chatkhil', 'Senbagh', 'Companyganj'] },
      { id: 'chandpur', name: 'Chandpur', nameBn: 'চাঁদপুর', popularThanas: ['Chandpur Sadar', 'Hajiganj', 'Matlab', 'Faridganj'] },
      { id: 'lakshmipur', name: 'Lakshmipur', nameBn: 'লক্ষ্মীপুর', popularThanas: ['Lakshmipur Sadar', 'Raipur', 'Ramganj', 'Ramgati'] },
      { id: 'rangamati', name: 'Rangamati', nameBn: 'রাঙ্গামাটি', popularThanas: ['Rangamati Sadar', 'Kaptai', 'Baghaichhari'] },
      { id: 'khagrachhari', name: 'Khagrachhari', nameBn: 'খাগড়াছড়ি', popularThanas: ['Khagrachhari Sadar', 'Dighinala', 'Matiranga'] },
      { id: 'bandarban', name: 'Bandarban', nameBn: 'বান্দরবান', popularThanas: ['Bandarban Sadar', 'Ruma', 'Thanchi', 'Lama'] }
    ]
  },
  {
    id: 'rajshahi',
    name: 'Rajshahi Division',
    nameBn: 'রাজশাহী বিভাগ',
    deliveryFee: 120,
    estimatedDelivery: '2 – 3 Days',
    districts: [
      { id: 'rajshahi-metro', name: 'Rajshahi', nameBn: 'রাজশাহী', popularThanas: ['Boalia', 'Motihar', 'Rajpara', 'Shah Makhdum', 'Godagari', 'Paba'] },
      { id: 'bogura', name: 'Bogura', nameBn: 'বগুড়া', popularThanas: ['Bogura Sadar', 'Sherpur', 'Shibganj', 'Gabtali', 'Dhunat'] },
      { id: 'pabna', name: 'Pabna', nameBn: 'পাবনা', popularThanas: ['Pabna Sadar', 'Ishwardi', 'Sujanagar', 'Santhia', 'Bera'] },
      { id: 'sirajganj', name: 'Sirajganj', nameBn: 'সিরাজগঞ্জ', popularThanas: ['Sirajganj Sadar', 'Ullapara', 'Shahjadpur', 'Belkuchi', 'Kazipur'] },
      { id: 'naogaon', name: 'Naogaon', nameBn: 'নওগাঁ', popularThanas: ['Naogaon Sadar', 'Mohadevpur', 'Patnitala', 'Manda'] },
      { id: 'natore', name: 'Natore', nameBn: 'নাটোর', popularThanas: ['Natore Sadar', 'Singra', 'Baraigram', 'Bagatipara'] },
      { id: 'chapainawabganj', name: 'Chapainawabganj', nameBn: 'চাঁপাইনবাবগঞ্জ', popularThanas: ['Sadar', 'Shibganj', 'Gomastapur', 'Nachole'] },
      { id: 'joypurhat', name: 'Joypurhat', nameBn: 'জয়পুরহাট', popularThanas: ['Joypurhat Sadar', 'Panchbibi', 'Kalai', 'Khetlal'] }
    ]
  },
  {
    id: 'khulna',
    name: 'Khulna Division',
    nameBn: 'খুলনা বিভাগ',
    deliveryFee: 120,
    estimatedDelivery: '2 – 3 Days',
    districts: [
      { id: 'khulna-metro', name: 'Khulna', nameBn: 'খুলনা', popularThanas: ['Khulna Sadar', 'Sonadanga', 'Khalishpur', 'Daulatpur', 'Dumuria', 'Rupsha'] },
      { id: 'jashore', name: 'Jashore', nameBn: 'যশোর', popularThanas: ['Jashore Sadar', 'Jhikargachha', 'Sharsha (Benapole)', 'Manirampur', 'Keshabpur'] },
      { id: 'kushtia', name: 'Kushtia', nameBn: 'কুষ্টিয়া', popularThanas: ['Kushtia Sadar', 'Kumarkhali', 'Mirpur', 'Bheramara'] },
      { id: 'jhenaidah', name: 'Jhenaidah', nameBn: 'ঝিনাইদহ', popularThanas: ['Jhenaidah Sadar', 'Kaliganj', 'Kotchandpur', 'Shailkupa'] },
      { id: 'satkhira', name: 'Satkhira', nameBn: 'সাতক্ষীরা', popularThanas: ['Satkhira Sadar', 'Kaliganj', 'Shyamnagar', 'Tala'] },
      { id: 'bagerhat', name: 'Bagerhat', nameBn: 'বাগেরহাট', popularThanas: ['Bagerhat Sadar', 'Mongla', 'Fakirhat', 'Rampal'] },
      { id: 'chuadanga', name: 'Chuadanga', nameBn: 'চুয়াডাঙ্গা', popularThanas: ['Chuadanga Sadar', 'Alamdanga', 'Damurhuda', 'Jibannagar'] },
      { id: 'magura', name: 'Magura', nameBn: 'মাগুরা', popularThanas: ['Magura Sadar', 'Sreepur', 'Mohammadpur', 'Shalikha'] },
      { id: 'meherpur', name: 'Meherpur', nameBn: 'মেহেরপুর', popularThanas: ['Meherpur Sadar', 'Gangni', 'Mujibnagar'] },
      { id: 'narail', name: 'Narail', nameBn: 'নড়াইল', popularThanas: ['Narail Sadar', 'Lohagara', 'Kalia'] }
    ]
  },
  {
    id: 'sylhet',
    name: 'Sylhet Division',
    nameBn: 'সিলেট বিভাগ',
    deliveryFee: 120,
    estimatedDelivery: '2 – 3 Days',
    districts: [
      { id: 'sylhet-metro', name: 'Sylhet', nameBn: 'সিলেট', popularThanas: ['Kotwali', 'Jalalabad', 'Shah Paran', 'South Surma', 'Beanibazar', 'Golapganj', 'Zakiganj'] },
      { id: 'moulvibazar', name: 'Moulvibazar', nameBn: 'মৌলভীবাজার', popularThanas: ['Moulvibazar Sadar', 'Sreemangal', 'Kulaura', 'Barlekha', 'Kamalganj'] },
      { id: 'habiganj', name: 'Habiganj', nameBn: 'হবিগঞ্জ', popularThanas: ['Habiganj Sadar', 'Madhabpur', 'Nabiganj', 'Bahubal', 'Chunarughat'] },
      { id: 'sunamganj', name: 'Sunamganj', nameBn: 'সুনামগঞ্জ', popularThanas: ['Sunamganj Sadar', 'Chhatak', 'Jagannathpur', 'Tahirpur', 'Derai'] }
    ]
  },
  {
    id: 'barishal',
    name: 'Barishal Division',
    nameBn: 'বরিশাল বিভাগ',
    deliveryFee: 120,
    estimatedDelivery: '3 – 4 Days',
    districts: [
      { id: 'barishal-metro', name: 'Barishal', nameBn: 'বরিশাল', popularThanas: ['Kotwali', 'Airport', 'Kawnia', 'Bakerganj', 'Babuganj', 'Banaripara'] },
      { id: 'bhola', name: 'Bhola', nameBn: 'ভোলা', popularThanas: ['Bhola Sadar', 'Borhanuddin', 'Char Fasson', 'Lalmohan', 'Daulatkhan'] },
      { id: 'patuakhali', name: 'Patuakhali', nameBn: 'পটুয়াখালী', popularThanas: ['Patuakhali Sadar', 'Kalapara (Kuakata)', 'Galachipa', 'Bauphal'] },
      { id: 'pirojpur', name: 'Pirojpur', nameBn: 'পিরোজপুর', popularThanas: ['Pirojpur Sadar', 'Mathbaria', 'Bhandaria', 'Nesarabad (Swarupkathi)'] },
      { id: 'barguna', name: 'Barguna', nameBn: 'বরগুনা', popularThanas: ['Barguna Sadar', 'Amtali', 'Patharghata', 'Betagi'] },
      { id: 'jhalokati', name: 'Jhalokati', nameBn: 'ঝালকাঠি', popularThanas: ['Jhalokati Sadar', 'Nalchity', 'Rajapur', 'Kathalia'] }
    ]
  },
  {
    id: 'rangpur',
    name: 'Rangpur Division',
    nameBn: 'রংপুর বিভাগ',
    deliveryFee: 120,
    estimatedDelivery: '2 – 3 Days',
    districts: [
      { id: 'rangpur-metro', name: 'Rangpur', nameBn: 'রংপুর', popularThanas: ['Kotwali', 'Tajhat', 'Mahi', 'Pirgachha', 'Mithapukur', 'Badarganj'] },
      { id: 'dinajpur', name: 'Dinajpur', nameBn: 'দিনাজপুর', popularThanas: ['Dinajpur Sadar', 'Birganj', 'Fulbari', 'Parbatipur', 'Nawabganj'] },
      { id: 'gaibandha', name: 'Gaibandha', nameBn: 'গাইবান্ধা', popularThanas: ['Gaibandha Sadar', 'Gobindaganj', 'Palashbari', 'Sundarganj'] },
      { id: 'kurigram', name: 'Kurigram', nameBn: 'কুড়িগ্রাম', popularThanas: ['Kurigram Sadar', 'Nageshwari', 'Ulipur', 'Rajarhat', 'Bhurungamari'] },
      { id: 'lalmonirhat', name: 'Lalmonirhat', nameBn: 'লালমনিরহাট', popularThanas: ['Lalmonirhat Sadar', 'Patgram (Burimari)', 'Aditmari', 'Kaliganj'] },
      { id: 'nilphamari', name: 'Nilphamari', nameBn: 'নীলফামারী', popularThanas: ['Nilphamari Sadar', 'Saidpur', 'Domar', 'Jaldhaka', 'Kishoreganj'] },
      { id: 'panchagarh', name: 'Panchagarh', nameBn: 'পঞ্চগড়', popularThanas: ['Panchagarh Sadar', 'Tetulia', 'Boda', 'Debiganj', 'Atwari'] },
      { id: 'thakurgaon', name: 'Thakurgaon', nameBn: 'ঠাকুরগাঁও', popularThanas: ['Thakurgaon Sadar', 'Pirganj', 'Ranisankail', 'Baliadangi'] }
    ]
  },
  {
    id: 'mymensingh',
    name: 'Mymensingh Division',
    nameBn: 'ময়মনসিংহ বিভাগ',
    deliveryFee: 120,
    estimatedDelivery: '2 – 3 Days',
    districts: [
      { id: 'mymensingh-metro', name: 'Mymensingh', nameBn: 'ময়মনসিংহ', popularThanas: ['Kotwali', 'Muktagachha', 'Trishal', 'Bhaluka', 'Gafargaon', 'Fulbaria'] },
      { id: 'jamalpur', name: 'Jamalpur', nameBn: 'জামালপুর', popularThanas: ['Jamalpur Sadar', 'Sarishabari', 'Melandaha', 'Islampur', 'Dewanganj'] },
      { id: 'netrokona', name: 'Netrokona', nameBn: 'নেত্রকোণা', popularThanas: ['Netrokona Sadar', 'Mohanganj', 'Kendua', 'Durgapur', 'Purbadhala'] },
      { id: 'sherpur', name: 'Sherpur', nameBn: 'শেরপুর', popularThanas: ['Sherpur Sadar', 'Nalitabari', 'Nakla', 'Jhenaigati', 'Sreebardi'] }
    ]
  }
];

export const TOTAL_DISTRICTS_COUNT = BANGLADESH_DIVISIONS.reduce((acc, div) => acc + div.districts.length, 0);
