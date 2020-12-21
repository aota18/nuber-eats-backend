import { Test } from "@nestjs/testing";
import { CONFIG_OPTIONS } from "src/common/common.constants";
import { MailService } from "./mail.service"
import * as FormData from 'form-data';
import got from 'got';

describe('MailService', () => {
    let service: MailService;


    /* External Module Mock */
    jest.mock("got");
    jest.mock('form-data');


    const TEST_DOMAIN = 'test-domain';

    beforeEach( async () => {
        const module = await Test.createTestingModule({
            providers: [MailService,
             {
                 provide:CONFIG_OPTIONS,
                 useValue: {
                     apiKey : "test-apiKey",
                     domain: TEST_DOMAIN,
                     fromEmail: 'test-fromEmail',
                 }
             }]
        }).compile();

        service = module.get<MailService>(MailService);
    })
    it("should be defined", () => {
        expect(service).toBeDefined();
    });


    describe('sendVerifictaion Email', () => {

        it('should call sendEmail', () => {
            const sendVerifictaionEmailArgs = {
                email: 'email',
                code: 'code',
            };

            jest.spyOn(service, 'sendEmail').mockImplementation(
                async() => true
            )
            service.sendVerificationEmail(
                sendVerifictaionEmailArgs.email,
                sendVerifictaionEmailArgs.code
            );

            expect(service.sendEmail).toHaveBeenCalledTimes(1);
            expect(service.sendEmail).toHaveBeenCalledWith(
                "Verify Your Email", 'verify-email', [
                    { key: 'code', value: sendVerifictaionEmailArgs.code},
                    { key: 'username', value: sendVerifictaionEmailArgs.email}
                ]
            )
        })
    })


    describe('sendEmail', () => {
        it('sends email', async() => {
            const ok = await service.sendEmail('', '', []);
           

            expect(ok).toEqual(false);
        });

        it('fails on error', async () => {
            jest.spyOn(got, 'post').mockImplementation(() => {
                throw new Error();
            })

            const ok = await service.sendEmail('', '', []);

            expect(ok).toEqual(false);
        })
    })
})