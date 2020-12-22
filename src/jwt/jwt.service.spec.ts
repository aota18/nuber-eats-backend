import { ObjectType } from '@nestjs/graphql';
import { Test, TestingModule } from '@nestjs/testing';
import { CONFIG_OPTIONS } from 'src/common/common.constants';
import { JwtService } from './jwt.service';
import * as jwt from 'jsonwebtoken';


jest.mock('jsonwebtoken', () => {
  return {
    sign: jest.fn(() => 'TOKEN'),
    verify: jest.fn(() => ({id: 1}))
  }
})
const TEST_KEY = 'testKey';

describe('JwtService', () => {
  let service: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JwtService, {
        provide: CONFIG_OPTIONS,
        useValue: {privateKey: TEST_KEY}
      }],
      
    }).compile();

    service = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });


  describe('sign', () => {
    
    it('should return a signed token', () => {
      const token = service.sign({id: 1});
      
      expect(jwt.sign).toHaveBeenCalledTimes(1);
      expect(jwt.sign).toHaveBeenLastCalledWith({id:1}, TEST_KEY)
    })
    
  });

  describe('verify', () => {
    it('should return the decoded token', () => {
      const TOKEN = "TOKEN"
      const decodedToken = service.verify(TOKEN);
      
      expect(decodedToken).toEqual({id: 1});
      
      expect(jwt.verify).toHaveBeenCalledTimes(1);
      expect(jwt.verify).toHaveBeenCalledWith(TOKEN, TEST_KEY)
    })
  })
});

