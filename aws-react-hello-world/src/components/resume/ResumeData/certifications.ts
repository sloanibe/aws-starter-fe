export interface Certification {
    name: string;
    issuer: string;
    dateAchieved?: string;
}

export const certifications: Certification[] = [
    {
        name: 'Java - Enterprise JavaBeans (EJB) 2.0',
        issuer: 'Brainbench'
    },
    {
        name: 'Weblogic Programming',
        issuer: 'BEA Systems - San Jose, CA'
    },
    {
        name: 'Weblogic 6.0 Administration',
        issuer: 'BEA Systems - San Jose, CA'
    },
    {
        name: 'PeopleTools',
        issuer: 'PeopleSoft - San Francisco, CA'
    }
];
