export class BrewLogResponseDto {
  id: string;
  brewing_time: number;
  brewing_temperature: number;
  leaf_amount: number;
  water_amount: number;
  rating: number;
  notes: string;
  focused: boolean;
  is_public: boolean;
  created_at: Date;

  tea: {
    id: string;
    name: string;
    type: string;
    custom_color: string;
    custom_brew_color: string;
    style: {
      id: string;
      name: string;
      color: string;
    } | null;
  };

  tastes: {
    id: string;
    taste: string;
    intensity: string;
  }[];

  flavour_profiles: {
    id: string;
    flavour_profile: {
      id: string;
      name: string;
      flavourType: {
        color: string;
      } | null;
    } | null;
  }[];

  // for public brew logs, we need to include the user information
  user: {
    display_name: string;
    user_name: string;
    avatar_url: string;
  } | null;
}
