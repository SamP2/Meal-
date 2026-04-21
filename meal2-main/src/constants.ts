import { Mess, MenuItem } from './types';

export const MOCK_MESSES: Mess[] = [
  {
    id: '1',
    name: 'The Hearthstone Organic',
    description: 'Fine farm-to-table traditional dining',
    rating: 4.8,
    distance: '0.8 km',
    hours: '8:00 AM - 9:30 PM',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA79dxGn484TiA-_eBYxwgxW-5Vg6q7xvEBNzsxvGvn5VpLtObnInZV2iENtbpNRDR1P_Nxxnz7OFrVptYL-u5ol_IR9Tt7t84Bgb5P3NvPdtd-3H7zy9L6N_6nje2mGEwRAGZyw1qZzcRvAl1z8kUKcT8JbhSiFejGKeK20X3Ji7mXhWnK5XDf8rpsJ3Kr15hW6OAgqZGJg4hvZvjICBzOLnrnZIhvc81WSjaGO2JHeYVi3D2KNEvrpvcI5P1sMwPzgwQWhRAodK0R',
    isVeg: true,
    isVerified: true,
    isOpen: true,
    priceRange: '$$',
    cuisine: 'Pure Veg'
  },
  {
    id: '2',
    name: 'Urban Spice Kitchen',
    description: 'Modern fusion and traditional spices',
    rating: 4.5,
    distance: '1.2 km',
    hours: '9:00 AM - 10:00 PM',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAj51--7YeyAphGFqiu4wuKDi4TXf_-cw-fxoqoS4a0NgeMGqRf9M8xz2vC147A8n3CdE4RNFHOhCxpFUnQ9qsv5X80w9fqQBUx1E0FuwM8pUXp3FHO1nxtzlq6TJP5MzLDpKpIrJRcmgnUGaifaUBx9gwsQuyL6tA9yRtchFBxjE5n2YXoel84O2QVMgUQdZ8MB0J8k6Dl1YTE0M66qZUbzKUN75LTIZabu5CD3w5gAf7I_hOC_Ykte9QRlTdMGWOWResQ8wb_hiEg',
    isVeg: false,
    isVerified: false,
    isOpen: true,
    priceRange: '$$',
    cuisine: 'Multi-Cuisine'
  },
  {
    id: '3',
    name: 'Harbor View Delights',
    description: 'Seaside flavors and fresh catches',
    rating: 4.2,
    distance: '2.5 km',
    hours: '11:00 AM - 11:00 PM',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDcF7SJWe9PdMqqFbg6ShTGkVYZ9xPSJY3i5SE7SZ2yxe6OTkiUGZXlu7Ofhu2-AmpXOJJia1r9xI8MPK9KGyfb7u5CrqWa1yzHG2pet5atuF1DIonH_nuNfuebTIiHbLmcWXxUDHEOuGukgHdvEYNlDIQ2KghOODs5LZEY__O6Z4FCbT5ya5bfbUjsPl-JojPL8wkDgAkNHXwrLZSb1qejNhLFs2lmUBt1UQppPNkru6s7mEATxzHRuVYXv5WLD0TFi0gqzRnh3gc_',
    isVeg: false,
    isVerified: true,
    isOpen: false,
    priceRange: '$$$',
    cuisine: 'Seafood'
  }
];

export const MOCK_MENU: MenuItem[] = [
  {
    id: 'm1',
    name: 'Organic Dal Tadka',
    description: 'Spiced yellow lentils with heirloom garlic',
    price: 5,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD8RALq9_u7aE9NOFiKGRqVkNohYLnCUSUK_P3RXWQMiGmS0V45hPkxd8v02FDSg86fq-Hf1ZpHMbN1bLoOVby-G6CJMZ6zMnQnpV9y527jDz0rxpr6YDk_KIviL5QypwUVdgC9BtzqaEaHdo97GdpF7BtBcS9b8c3g_Q3RJ98p-mawwjiXy46DetRzC7IEhKptFmMpLvk5xcC41inH6Oonf-GlJo_zQd3755f6ZruumR3SVRTqQTi5_NMk7maAfXaqdqVtSuk9-qDV'
  },
  {
    id: 'm2',
    name: 'Whole Wheat Roti',
    description: 'Hand-rolled organic stoneground wheat',
    price: 1,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBvaS3KQiGGnWVT41QD_KcQfpxk1neNAzCOD6Ela5VnDdZ5QH7XcY3CWkShiGc3MJlxLzcySPYjWXH2HpvOxK6UreK5WfcdHcUC8j6_tQYJsn-7DO3rz99Gl02jDnhG0jKXm9I_aD7puo-LVCJV3C3bGho3in1rSe0BChvxFApwbkOnesTmrFEYAJ-lecSIKD8gdc9Jn9SJskqw1nM37SnDs_pFFQrDvD-PXzNdTwxgcENQ8SxW0duXsCHGN6EtZy0bunCmENSf3YEH'
  },
  {
    id: 'm3',
    name: 'Steamed Basmati Rice',
    description: 'Aromatic long-grain aged rice',
    price: 3,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCLCqkxmxeenaHVhx4eyNwqkxsx56J_JtRR9J-mDFWCSlm2qC1FZwHJRsoqF57PT5ldFdUx5xcan5fxK814yalwa0i_4GRwYNLIZu3vagC2VKv9QJo03zuIaZqs-Mx9XDE0GitD9-MyRq3DBznNlnVE0L8Vco7H9a7LVe0K7Y87ZNHEuPv2UO63qAQ-tL40YOVmebgGqn00jS3BBmjQ5aEpljdzixnAnJ9a5A5kEZVAjzvpgT9LifgpBo6r-zZJMXTMP7ShXnGfccMK'
  }
];
