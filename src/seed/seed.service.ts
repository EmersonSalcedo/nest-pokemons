import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { catchError, firstValueFrom } from 'rxjs';
import { PokeResponse} from './interfaces/poke-response.interface';
import { HttpService } from '@nestjs/axios';
import { AxiosError } from 'axios';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Pokemon } from 'src/pokemon/entities/pokemon.entity';

@Injectable()
export class SeedService {

  constructor(
    private readonly httpService: HttpService,
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>
  ) { }

  private readonly apiUrl = 'https://pokeapi.co/api/v2/pokemon?limit=650'

  async executeSeed() {

    await this.pokemonModel.deleteMany({});

    const pokemonToInsert: { name: string, no: number }[] = [];

    const { data } = await firstValueFrom(
      this.httpService.get<PokeResponse>(this.apiUrl)
        .pipe(
          catchError((error: AxiosError) => {
            console.log(error)
            throw new InternalServerErrorException('An error happened! - Check server logs')
          }),
        )
    );

    data.results.forEach(({ name, url }) => {
      const segments = url.split('/');
      const no = +segments[segments.length - 2];
      // const pokemon = await this.pokemonModel.create( {name,no} );
      pokemonToInsert.push({ name, no });
    })

    await this.pokemonModel.insertMany( pokemonToInsert );

    return 'Seed Executed'

  }

}
