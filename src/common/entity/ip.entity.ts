import { Column } from 'typeorm';

export class IP {
    @Column({ length: 16 })
    ipv4: string;

    @Column({ nullable: true })
    country: string;

    @Column({ nullable: true })
    province: string;

    @Column({ nullable: true })
    city: string;

    @Column({ nullable: true })
    isp: string;
}
