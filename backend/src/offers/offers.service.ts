import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { CreateOfferDto } from './dto/create-offer.dto';
import { UpdateOfferDto } from './dto/update-offer.dto';
import { Offer } from './entities/offer.entity';
import { Wish } from '../wishes/entities/wish.entity';
import { BadOfferError } from '../errors/bad-offer.error';
import { NotFoundError } from '../errors/not-found.error';

@Injectable()
export class OffersService {
  constructor(
    @InjectRepository(Offer)
    private offerRepository: Repository<Offer>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Wish)
    private wishRepository: Repository<Wish>,
    private readonly dataSource: DataSource,
  ) {}

  async create(createOfferDto: CreateOfferDto, userId: number) {
    let res: Offer;

    const [user, wish] = await Promise.all([
      this.userRepository.findOneBy({ id: userId }),
      this.wishRepository.findOne({
        where: { id: createOfferDto.itemId },
        relations: { owner: true },
      }),
    ]);

    if (!wish) throw new NotFoundError('Желание не найдено');

    if (userId === wish.owner.id)
      throw new BadOfferError('Нельзя вносить деньги на собственные желания');

    const newRaised = wish.raised + createOfferDto.amount;

    if (newRaised > wish.price)
      throw new BadOfferError('Собранная сумма превышает стоимость желания');

    const offer = this.offerRepository.create({
      ...createOfferDto,
      item: wish,
      user,
    });

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await this.wishRepository.save({ ...wish, raised: newRaised });
      res = await this.offerRepository.save(offer);
      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }

    return res;
  }

  async findAll() {
    return this.offerRepository.find({
      relations: ['item', 'user'],
    });
  }

  async findOne(id: number) {
    const offer = await this.offerRepository.findOne({
      where: { id },
      relations: ['item', 'user'],
    });

    if (!offer) throw new NotFoundError('Такое предложение не найдено');

    return offer;
  }

  async update(id: number, updateOfferDto: UpdateOfferDto) {
    const offer = await this.offerRepository.findOneBy({ id });

    if (!offer) throw new NotFoundError('Такое предложение не найдено');

    return this.offerRepository.update({ id }, updateOfferDto);
  }

  async remove(id: number) {
    const offer = await this.offerRepository.findOne({
      where: { id },
      relations: ['item', 'user'],
    });

    if (!offer) throw new NotFoundError('Такое предложение не найдено');

    return this.offerRepository.delete({ id });
  }
}
