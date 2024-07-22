import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { catchError, firstValueFrom } from 'rxjs';
import { PokeResponse, Result } from './interfaces/poke-response.interface';
import { HttpService } from '@nestjs/axios';
import { AxiosError } from 'axios';

@Injectable()
export class SeedService {

  constructor(private readonly httpService: HttpService) { }

  private readonly apiUrl = 'https://pokeapi.co/api/v2/pokemon?limit=1'

  async executeSeed(): Promise<Result[]> {
    const {data} = await firstValueFrom(
      this.httpService.get<PokeResponse>(this.apiUrl)
        .pipe(
          catchError((error: AxiosError) => {
            console.log(error)
            throw new InternalServerErrorException('An error happened! - Check server logs')
          }),
        )
    );

    data.results.forEach(({name,url}) => {
      const segments = url.split('/');
      const no = +segments[ segments.length - 2];

      console.log({name, no})
    })

    return data.results

  }

}
