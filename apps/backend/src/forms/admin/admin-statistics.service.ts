import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import FormSchema from '../../entities/form-schema.entity';
import FormSubmission from '../../entities/form-submission.entity';
import Users from '../../entities/user.entity';
import { getRejectedUserIds } from './rejected-users.util';

interface FieldDefinition {
  name: string;
  label: string;
  type: string;
  options?: { label: string; value: string }[];
}

export interface OptionCount {
  label: string;
  value: string;
  count: number;
}

export interface ProvinceCityData {
  provinceCounts: OptionCount[];
  cityCounts: Record<string, OptionCount[]>;
}

export interface ContinentCountryData {
  continentCounts: OptionCount[];
  countryCounts: Record<string, OptionCount[]>;
}

export interface FieldStat {
  name: string;
  label: string;
  type: string;
  total: number;
  options: OptionCount[];
  provinceCity?: ProvinceCityData;
  continentCountry?: ContinentCountryData;
}

@Injectable()
export class AdminStatisticsService {
  constructor(
    @InjectRepository(FormSchema)
    private readonly formSchemaRepository: Repository<FormSchema>,
    @InjectRepository(FormSubmission)
    private readonly submissionRepository: Repository<FormSubmission>,
    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>,
  ) {}

  async getStatistics(formId: number) {
    const form = await this.formSchemaRepository.findOne({
      where: { id: formId },
    });

    if (!form) {
      throw new NotFoundException('Form not found');
    }

    const rejectedUserIds = await getRejectedUserIds(this.usersRepository);

    const submissions = (
      await this.submissionRepository.find({
        where: { form_id: formId },
      })
    ).filter((s) => !rejectedUserIds.has(s.user_id));

    if (submissions.length === 0) {
      return {
        form,
        fields: [],
        totalSubmissions: 0,
      };
    }

    const statFields = (form.fields as FieldDefinition[]).filter((f) =>
      [
        'select',
        'radio',
        'checkbox',
        'province_city',
        'continent_country',
      ].includes(f.type),
    );

    const fields: FieldStat[] = statFields.map((field) => {
      if (field.type === 'province_city') {
        return this.buildProvinceCityStat(field, submissions);
      }
      if (field.type === 'continent_country') {
        return this.buildContinentCountryStat(field, submissions);
      }

      const optionMap = new Map<string, number>();

      (field.options || []).forEach((opt) => {
        optionMap.set(opt.value, 0);
      });

      submissions.forEach((sub) => {
        const answer = sub.answers[field.name];
        if (answer === undefined || answer === null || answer === '') return;
        if (answer === '' || (Array.isArray(answer) && answer.length === 0))
          return;

        if (Array.isArray(answer)) {
          answer.forEach((val: string) => {
            optionMap.set(val, (optionMap.get(val) || 0) + 1);
          });
        } else if (typeof answer === 'string') {
          optionMap.set(answer, (optionMap.get(answer) || 0) + 1);
        }
      });

      const options: OptionCount[] = (field.options || []).map((opt) => ({
        label: opt.label,
        value: opt.value,
        count: optionMap.get(opt.value) || 0,
      }));

      return {
        name: field.name,
        label: field.label,
        type: field.type,
        total: submissions.length,
        options,
      };
    });

    return {
      form,
      fields,
      totalSubmissions: submissions.length,
    };
  }

  private buildProvinceCityStat(
    field: FieldDefinition,
    submissions: FormSubmission[],
  ): FieldStat {
    const provinceMap = new Map<string, number>();
    const cityMap = new Map<string, Map<string, number>>();

    submissions.forEach((sub) => {
      const answer = sub.answers[field.name];
      if (!answer || typeof answer !== 'object' || Array.isArray(answer))
        return;

      const { province, city } = answer as { province?: string; city?: string };
      if (!province) return;

      provinceMap.set(province, (provinceMap.get(province) || 0) + 1);

      if (city) {
        if (!cityMap.has(province)) {
          cityMap.set(province, new Map());
        }
        const cities = cityMap.get(province)!;
        cities.set(city, (cities.get(city) || 0) + 1);
      }
    });

    const provinceCounts: OptionCount[] = Array.from(provinceMap.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([value, count]) => ({
        label: value,
        value,
        count,
      }));

    const cityCounts: Record<string, OptionCount[]> = {};
    cityMap.forEach((cities, province) => {
      cityCounts[province] = Array.from(cities.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([value, count]) => ({
          label: value,
          value,
          count,
        }));
    });

    return {
      name: field.name,
      label: field.label,
      type: field.type,
      total: submissions.length,
      options: [],
      provinceCity: {
        provinceCounts,
        cityCounts,
      },
    };
  }

  private buildContinentCountryStat(
    field: FieldDefinition,
    submissions: FormSubmission[],
  ): FieldStat {
    const continentMap = new Map<string, number>();
    const countryMap = new Map<string, Map<string, number>>();

    submissions.forEach((sub) => {
      const answer = sub.answers[field.name];
      if (!answer || typeof answer !== 'object' || Array.isArray(answer))
        return;

      const { continent, country } = answer as {
        continent?: string;
        country?: string;
      };
      if (!continent) return;

      continentMap.set(continent, (continentMap.get(continent) || 0) + 1);

      if (country) {
        if (!countryMap.has(continent)) {
          countryMap.set(continent, new Map());
        }
        const countries = countryMap.get(continent)!;
        countries.set(country, (countries.get(country) || 0) + 1);
      }
    });

    const continentCounts: OptionCount[] = Array.from(continentMap.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([value, count]) => ({
        label: value,
        value,
        count,
      }));

    const countryCounts: Record<string, OptionCount[]> = {};
    countryMap.forEach((countries, continent) => {
      countryCounts[continent] = Array.from(countries.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([value, count]) => ({
          label: value,
          value,
          count,
        }));
    });

    return {
      name: field.name,
      label: field.label,
      type: field.type,
      total: submissions.length,
      options: [],
      continentCountry: {
        continentCounts,
        countryCounts,
      },
    };
  }
}
