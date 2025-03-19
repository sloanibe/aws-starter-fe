interface ContactInfo {
    location: string;
    phone: string;
    email: string;
    linkedIn: { text: string; url: string };
    relocate: boolean;
}

interface PersonalInfo {
    name: string;
    contactInfo: ContactInfo;
}

export const personalInfo: PersonalInfo = {
    name: 'MARK R. SLOAN',
    contactInfo: {
        location: 'Wildomar, CA 92595',
        phone: '+1 951 584 4480',
        email: 'sloanibe@gmail.com',
        linkedIn: { text: 'LinkedIn', url: 'https://www.linkedin.com/in/markrsloan/' },
        relocate: true
    }
};
