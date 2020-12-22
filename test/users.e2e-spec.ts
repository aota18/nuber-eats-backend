import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { UserProfileOutput } from 'src/users/dtos/user-profile.dto';
import { getConnection, getRepository, Repository } from 'typeorm';
import { User } from 'src/users/entites/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

jest.mock('got', () => {
  return {
    post: jest.fn(),
  }
})
const GRAPHQL_ENDPOINT = '/graphql';
const testUser = {
  email: 'abc@123.com',
  password: '1234'
}
describe('UserModule (e2e)', () => {
  let app: INestApplication;
  let usersRepository: Repository<User>
  let token: string;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    usersRepository = module.get<Repository<User>>(getRepositoryToken(User))
    await app.init();
  });

  afterAll( async () => {
    await getConnection().dropDatabase();
    app.close();
  })

  describe('createAccount', () => {
 
    it('should create account', () => {
      return request(app.getHttpServer()).post(GRAPHQL_ENDPOINT).send({
        query: `
        mutation{
          createAccount(input:{
            email: "${testUser.email}",
            password:"${testUser.password}",
            role:Client
          }){
            ok
            error
          }
        }`
      }).expect(200)
      .expect(res => {
        console.log(res.body);
      })
    });

    it('should fail if account already exists', () => {
      return request(app.getHttpServer()).post(GRAPHQL_ENDPOINT).send({
        query: `
        mutation{
          createAccount(input:{
            email: "${testUser.email}",
            password:"${testUser.password}",
            role:Client
          }){
            ok
            error
          }
        }`
      }).expect(200)
      .expect(res => {
        expect(res.body.data.createAccount.ok).toBe(false);
        expect(res.body.data.createAccount.error).toEqual(expect.any(String));
      })
    })
  });
    
  describe('login', () => {
    it('should login with correct credentials', () => {
      return request(app.getHttpServer()).post(GRAPHQL_ENDPOINT).send({
        query: `
        mutation{
          login(input:{
            email: "${testUser.email}",
            password:"${testUser.password}",
          }){
            ok
            error
            token
          }
        }
        `
      }).expect(200)
      .expect(res => {
        const { body: {
          data: {login},
        },
      } = res;
      expect(login.ok).toBe(true);
      expect(login.error).toBe(null);
      expect(login.token).toEqual(expect.any(String));
      token = login.token;
      })
    });

    it('should not be able to login with wrong credentials', () => {
      return request(app.getHttpServer()).post(GRAPHQL_ENDPOINT).send({
        query: `
        mutation{
          login(input:{
            email: "${testUser.email}",
            password:"23",
          }){
            ok
            error
            token
          }
        }
        `
      }).expect(200)
      .expect(res => {
        const { body: {
          data: {login},
        },
      } = res;
      expect(login.ok).toBe(false);
      expect(login.error).toBe("Wrong password");
      expect(login.token).toEqual(null);
    });
  });

  });
  
  describe('userProfile', () => {
    let userId: number;
    beforeAll(async () => {
      const [user] = await usersRepository.find();
      userId = user.id;
    });

    it('should see a users profile', () => {
      return request(app.getHttpServer()).post(GRAPHQL_ENDPOINT)
      .set(`X-JWT`, token)
      .send({
        query: `
        {
          userProfile(userId: 1) {
            ok
            error
            user {
              id
            }
          }
        }
        `
      })
      .expect(200)
      .expect(res => {
        const {
          body: {
            data: {
              userProfile: {
                ok,
                error,
                user: {id},
              }
            }
          }
        } = res;
        expect(ok).toBe(true);
        expect(error).toBe(null);
        expect(id).toBe(1);
      });

     
    });
    it('should not find a profile', () => {
      return request(app.getHttpServer()).post(GRAPHQL_ENDPOINT)
      .set('X-JWT', token)
      .send({
        query: `
        {
          userProfile(userId: 2) {
            ok
            error
            user {
              id
            }
          }
        }
        `
      })
      .expect(200)
      .expect(res => {
        const {
          body: {
            data: {
              userProfile: {
                ok,
                error,
              }
            }
          }
        } = res;
        expect(ok).toBe(false);
        expect(error).toBe('User not found');
      }) 
    });
  });
  describe('me', ()=> {
    it('should find my profile', () => {
      return request(app.getHttpServer()).post(GRAPHQL_ENDPOINT)
      .set('X-JWT', token)
      .send({
        query: `
        {
          me {
            email
          }
        }
        `
      })
      .expect(200)
      .expect(res => {
        console.log(res.body);
        const {
          body: {
            data: {
              me : {
                email
              }
            }
          }
        } = res;
        expect(email).toBe(testUser.email);
      })
    });

    it('should not allow logged out user', () => {
      return request(app.getHttpServer()).post(GRAPHQL_ENDPOINT)
      .send({
        query: `
        {
          me {
            email
          }
        }
        `
      })
      .expect(200)
      .expect(res => {
        const {
          body: {
            errors
          }
        } = res;
        const [error] = errors;
        expect(error.message).toBe("Forbidden resource");
    })
  });
});
  it.todo('verifyEmail');
  it.todo('editProfile');
});
