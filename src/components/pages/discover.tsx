import { Fragment, useState } from 'react';

import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import {
  Avatar,
  Box,
  Button,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Menu,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material';

import axiosInstance from '../../app/api/axiosInstance';
import { useAppSelector } from '../../app/hooks';
import { SearchedShow, convertToSearchShow } from '../../app/model/shows';
import { selectCurrentAccount } from '../../app/slices/authSlice';
import { selectAllProfiles } from '../../app/slices/profilesSlice';
import axios from 'axios';

function Discover() {
  const account = useAppSelector(selectCurrentAccount)!;
  const profiles = useAppSelector(selectAllProfiles);
  const [shows, setShows] = useState<SearchedShow[]>([]);
  const [searchText, setSearchText] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleFavoriteClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleFavoriteClose = () => {
    setAnchorEl(null);
  };

  const handleFavoriteProfileClick = async (profileId: string, showId: number) => {
    setAnchorEl(null);
    try {
      await axiosInstance.post(`/api/accounts/${account.id}/profiles/${profileId}/favorites`, { showId: showId });
    } catch (error) {
      console.error(error);
    }
  };

  const handleSearch = async () => {
    try {
      const searchString = replaceSpacesWithPlus(searchText);
      const response = await axios.get(`https://api.tvmaze.com/search/shows?q=:${searchString}`);
      const searchResults = convertToSearchShow(response.data);
      setShows(searchResults);
    } catch (error) {
      console.error(error);
    }
  };

  function replaceSpacesWithPlus(input: string): string {
    return input.replace(/ /g, '+');
  }

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <>
      <Typography variant="h4">Discover</Typography>
      <Box display="flex" alignItems="center" marginY={2}>
        <TextField
          label="Search"
          variant="outlined"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onKeyDown={handleKeyPress}
          fullWidth
        />
        <Button variant="contained" color="primary" onClick={handleSearch} style={{ marginLeft: '8px' }}>
          Search
        </Button>
      </Box>
      {shows.length > 0 ? (
        <List>
          {shows.map((show) => (
            <Fragment key={show.id}>
              <Menu
                id="basic-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleFavoriteClose}
                MenuListProps={{
                  'aria-labelledby': 'favorite-button',
                }}
                slotProps={{
                  paper: {
                    sx: {
                      boxShadow: '1',
                    },
                  },
                }}
              >
                {profiles.map((profile) => (
                  <MenuItem
                    key={profile.id}
                    onClick={() => {
                      handleFavoriteProfileClick(profile.id, show.id);
                    }}
                  >
                    {profile.name}
                  </MenuItem>
                ))}
              </Menu>
              <ListItem
                alignItems="flex-start"
                secondaryAction={
                  <Button
                    id="favorite-button"
                    aria-controls={open ? 'basic-menu' : undefined}
                    aria-haspopup="true"
                    aria-expanded={open ? 'true' : undefined}
                    onClick={handleFavoriteClick}
                    endIcon={<KeyboardArrowDownIcon />}
                    variant="outlined"
                  >
                    Favorite
                  </Button>
                }
              >
                <ListItemAvatar sx={{ width: 96, height: 96, p: 1 }}>
                  <Avatar alt={show.title} src={show.image} variant="rounded" sx={{ width: 96, height: 96 }} />
                </ListItemAvatar>
                <ListItemText
                  primary={show.title}
                  secondary={
                    <Typography
                      component="span"
                      variant="caption"
                      sx={{ display: 'block', marginTop: 1, paddingRight: '120px' }} // Add spacing below the secondary text
                    >
                      <i>{show.summary}</i>
                      <br />
                      <b>Genres:</b> {show.genres.join(', ')}
                      <br />
                      <b>Streaming Service:</b> {show.network}
                      <br />
                      <b>Premiered:</b> {show.premiered}
                    </Typography>
                  }
                  slotProps={{
                    primary: { variant: 'subtitle1' },
                  }}
                />
              </ListItem>
              <Divider variant="inset" component="li" />
            </Fragment>
          ))}
        </List>
      ) : (
        <Box>
          <Typography variant="h6" align="center">
            No Shows Found
          </Typography>
        </Box>
      )}
    </>
  );
}

export default Discover;
