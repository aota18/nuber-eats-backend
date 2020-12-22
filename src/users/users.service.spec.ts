import { Test } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { JwtService } from "src/jwt/jwt.service";
import { MailService } from "src/mail/mail.service";
import { Repository } from "typeorm";
import { User } from "./entites/user.entity";
import { Verification } from "./entites/verification.entity";
import { UsersService } from "./users.service";

const mockRepository = () => ({
    findOne : jest.fn(),
    save : jest.fn(),
    create : jest.fn(),
    findOneOrFail: jest.fn(),
});

const mockJwtService = {
    sign : jest.fn(() => "signed-token-baby"),
    verify : jest.fn(),
}

const mockMailService = {
    sendVerificationEmail: jest.fn(),
};

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe("UserService", () => {

    let service: UsersService;
    let userRepository : MockRepository<User>;
    let verificationRepository: MockRepository<Verification>;
    let mailService: MailService;
    let jwtService: JwtService;

    /* All modules are being created for each tests */
    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [UsersService, {
                provide: getRepositoryToken(User),
                useValue: mockRepository()
            },
            {
                provide: getRepositoryToken(Verification),
                useValue: mockRepository()
            },
            {
                provide: JwtService,
                useValue: mockJwtService
            },
            {
                provide: MailService,
                useValue: mockMailService
            }
        ], 
        }).compile();

        service = module.get<UsersService>(UsersService);
        mailService = module.get<MailService>(MailService);
        jwtService = module.get<JwtService>(JwtService)
        userRepository = module.get(getRepositoryToken(User));
        verificationRepository = module.get(getRepositoryToken(Verification));
    });


    it('should be defined', () =>{
        expect(service).toBeDefined();
    })

    describe ("createAccount", () => {
        const createAccountArgs = {
            email: 'aga',
            password: '',
            role: 0,
        }

        it ("should fail if user exists", async() => {
            userRepository.findOne.mockResolvedValue({
                id: 1,
                email: 'aga'
            });
            const result = await service.createAccount({
                email: 'aga',
                password: '',
                role: 0,
            });

            expect(result).toMatchObject({
                ok: false,
                error:  "There is a user with that email already"
            })
        });


        it("should create a user", async() => {

            /* Mock Return Value */
            userRepository.findOne.mockResolvedValue(undefined);
            userRepository.create.mockReturnValue(createAccountArgs);
            userRepository.save.mockResolvedValue(createAccountArgs);
            verificationRepository.create.mockReturnValue({
                user: createAccountArgs
            });
            verificationRepository.save.mockResolvedValue({
                code: 'code'
            });


            /* Execute create account */

            const result = await service.createAccount(createAccountArgs);


            /* Expect the results */
            expect(userRepository.create).toHaveBeenCalledTimes(1);
            expect(userRepository.create).toHaveBeenCalledWith(createAccountArgs);

            expect(userRepository.save).toHaveBeenCalledTimes(1);
            expect(userRepository.save).toHaveBeenCalledWith(createAccountArgs);

            expect(verificationRepository.create).toHaveBeenCalledTimes(1);
            expect(verificationRepository.create).toHaveBeenCalledWith({
                user: createAccountArgs
            })

            expect(verificationRepository.save).toHaveBeenCalledTimes(1);
            expect(verificationRepository.save).toHaveBeenCalledWith({
                user: createAccountArgs
            });

            expect(mailService.sendVerificationEmail).toHaveBeenCalledTimes(1);
            expect(mailService.sendVerificationEmail).toHaveBeenCalledWith(expect.any(String), expect.any(String));

            expect(result).toEqual({ok: true});
        })
        
        it("should fail on exception", async() => {
            userRepository.findOne.mockRejectedValue(new Error(""));

            const result = await service.createAccount(createAccountArgs)

            expect(result).toEqual({ok: false, error: "Couldn't create account"});
        })
    })
    describe('login', () => {
        const loginArgs = {
            email: 'abc@123.com',
            password: '1234'
        }
        it('should fail if user does not exists', async() => {
            userRepository.findOne.mockResolvedValue(null);

            const result = await service.login(loginArgs);
            
            expect(userRepository.findOne).toHaveBeenCalledTimes(1);
            expect(userRepository.findOne).toHaveBeenCalledWith(
                expect.any(Object),
                expect.any(Object)
            );

            expect(result).toEqual({
                ok: false,
                error: "User not found"
            });
        })

        it('should fail if the password is wrong', async() => {
            const mockedUser = {
                id: 1,
                checkPassword: jest.fn(() => Promise.resolve(false))
            };

            userRepository.findOne.mockResolvedValue(mockedUser);
            const result = await service.login(loginArgs);

            expect(result).toEqual({
                ok: false,
                error: "Wrong password",
            })
        });

        it('should return token if password is correct', async () => {
            const mockedUser = {
                id: 1,
                checkPassword: jest.fn(() => Promise.resolve(true))
            };

            userRepository.findOne.mockResolvedValue(mockedUser);
            const result = await service.login(loginArgs);

            expect(jwtService.sign).toHaveBeenCalledTimes(1);
            expect(jwtService.sign).toHaveBeenCalledWith(expect.any(Object));

            expect(result).toEqual({
                ok: true,
                token: 'signed-token-baby'
            })
        });

        it('should fail on execption', async() => {
            userRepository.findOne.mockRejectedValue(new Error());
            const result = await service.login(loginArgs);
            expect (result).toEqual({
                ok: false,
                error: "Can't log user in"
            })
        })
    });

    describe('findById', () => {

        const findByIdArgs = {
            id: 1
        }
        it('should return user ', async () => {
            userRepository.findOneOrFail.mockResolvedValue(findByIdArgs);
            const result = await service.findById(1);
            expect (result).toEqual({ok: true, user: findByIdArgs});
        });

       it('should fail if no user is found', async () => {
           userRepository.findOneOrFail.mockRejectedValue(new Error());
           const result = await service.findById(1);

           expect(result).toEqual(
            {ok: false, error: 'User not found'}
           )
       })
    });

})