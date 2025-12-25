export interface Country {
  name: string;
  code: string;
  phoneCode: string;
  states: string[];
}

export const COUNTRIES: Country[] = [
  {
    name: 'United States',
    code: 'US',
    phoneCode: '+1',
    states: ['Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming']
  },
  {
    name: 'India',
    code: 'IN',
    phoneCode: '+91',
    states: ['Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal']
  },
  {
    name: 'United Kingdom',
    code: 'GB',
    phoneCode: '+44',
    states: ['England', 'Scotland', 'Wales', 'Northern Ireland']
  },
  {
    name: 'Canada',
    code: 'CA',
    phoneCode: '+1',
    states: ['Alberta', 'British Columbia', 'Manitoba', 'New Brunswick', 'Newfoundland and Labrador', 'Northwest Territories', 'Nova Scotia', 'Nunavut', 'Ontario', 'Prince Edward Island', 'Quebec', 'Saskatchewan', 'Yukon']
  },
  {
    name: 'Australia',
    code: 'AU',
    phoneCode: '+61',
    states: ['New South Wales', 'Victoria', 'Queensland', 'Western Australia', 'South Australia', 'Tasmania', 'Northern Territory', 'Australian Capital Territory']
  }
];

export const ZIP_CODES: { [key: string]: { [key: string]: string[] } } = {
  'United States': {
    'California': ['90001', '90002', '90003', '90210', '94102'],
    'New York': ['10001', '10002', '10003', '10004', '10005'],
    'Texas': ['77001', '77002', '77003', '75201', '75202'],
    'Florida': ['33101', '33102', '33109', '33401'],
    'Illinois': ['60601', '60602', '60603', '60604']
  },
  'India': {
    'Maharashtra': ['400001', '400003', '400604', '401101', '402201', '410206', '411001', '412101', '421001', '431001'],
    'Karnataka': ['560001', '560008', '560034', '560066', '561203', '562110', '570001', '571201', '572101', '573201', '574101', '575001', '576101', '577001', '577501', '578001', '580001', '581301', '582101', '585101'],
    'Tamil Nadu': ['600001', '600004', '600011', '600037', '600083', '602001', '603103', '604001', '605001', '607001'],
    'West Bengal': ['700001', '700006', '700019', '700034', '700064', '711101', '712101', '713101', '721101', '743123'],
    'Delhi': ['110001', '110002', '110003', '110004', '110005', '110006', '110007', '110008', '110009', '110010'],
    'Andhra Pradesh' : ['515001', '515871', '517001', '517642', '533001', '533578', '534001', '534466', '522001', '522549'],
    'Uttar Pradesh' : ['201001', '201301', '202001', '203001', '204101', '205001', '206001', '207001', '208001', '209801'],
    'Himachal Pradesh' : ['121001', '122001', '123401', '124001', '125001', '126102', '127021', '131001', '132001', '136118'],
    'Goa' : ['403001','403004', '403006', '403101', '403202', '403401', '403502', '403515', '403703', '403806'],
    'Punjab' : ['140001', '141001', '142001', '143001', '144001', '145001', '146001', '147001', '148001', '152001'],
    'Uttrakhand' : ['248001', '248002', '249201', '249401', '263001', '263139', '263153', '262501', '244713', '246149'],
    'Manipur' : ['795001', '795002', '795003', '795004', '795005', '795006', '795007', '795128', '795133', '795159'],
    'Assam' : ['781001', '781003', '781012', '781021', '781032', '782001', '783301', '784001', '785001', '786001'],
    'Jammu Kashmir' : ['180001', '180003', '181101', '182101', '190001', '190005', '191101', '192101', '193201', '194101'],
    'Kerala' : ['670001', '670104', '671121', '673001', '673571', '682001', '683101', '686001', '690101', '695001'],
  },
  'United Kingdom': {
    'England': ['SW1A 1AA', 'M1 1AA', 'B1 1AA'],
    'Scotland': ['EH1 1AA', 'G1 1AA'],
    'Wales': ['CF1 1AA'],
    'Northern Ireland': ['BT1 1AA']
  },
  'Canada': {
    'Ontario': ['M5H 2N2', 'M5J 2N2'],
    'British Columbia': ['V6B 1A1'],
    'Alberta': ['T2P 1J7']
  },
  'Australia': {
    'New South Wales': ['2000', '2001'],
    'Victoria': ['3000', '3001'],
    'Queensland': ['4000', '4001']
  }
};

