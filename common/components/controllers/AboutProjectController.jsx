// @flow

import React from 'react';
import _ from 'lodash'
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Divider from '@material-ui/core/Divider';
import ProjectAPIUtils from '../utils/ProjectAPIUtils.js';
import {Earth, MapMarker, Clock, Domain, ChartBar, Key, Meetup, GithubCircle, Slack, Trello, GoogleDrive} from 'mdi-material-ui';
import Tooltip from '@material-ui/core/Tooltip';
import ProjectDetails from '../componentsBySection/FindProjects/ProjectDetails.jsx';
import ContactProjectButton from "../common/projects/ContactProjectButton.jsx";
import ProjectVolunteerButton from "../common/projects/ProjectVolunteerButton.jsx";
import {LinkNames} from "../constants/LinkConstants.js";
import metrics from "../utils/metrics.js";
import AboutPositionEntry from "../common/positions/AboutPositionEntry.jsx";
import ProjectVolunteerModal from "../common/projects/ProjectVolunteerModal.jsx";
import GlyphStyles from "../utils/glyphs.js";
import CurrentUser from "../utils/CurrentUser.js";
import ProjectOwnersSection from "../common/owners/ProjectOwnersSection.jsx";
import VolunteerSection from "../common/volunteers/VolunteerSection.jsx";

//TODO: reenable these as I need them if I need them (from master merge)
// import type {ProjectDetailsAPIData} from '../utils/ProjectAPIUtils.js';
// import type {PositionInfo} from "../forms/PositionInfo.jsx";
// import NotificationModal from "../common/notification/NotificationModal.jsx";
// import TagsDisplay from '../common/tags/TagsDisplay.jsx'
// import url from '../utils/url.js'
// import VerifyEmailBlurb from "../common/notification/VerifyEmailBlurb.jsx";
// import {Locations} from "../constants/ProjectConstants.js";
// import {TagDefinition} from "../utils/ProjectAPIUtils.js";


type State = {|
  project: ?ProjectDetailsAPIData,
  showJoinModal: boolean,
  positionToJoin: ?PositionInfo,
  showPositionModal: boolean,
  shownPosition: ?PositionInfo,
  tabs: object
|};

class AboutProjectController extends React.PureComponent<{||}, State> {

  constructor(): void{
    super();
    this.state = {
    project: null,
    showContactModal: false,
    showPositionModal: false,
    shownPosition: null,
    tabs: {
      details: true,
      skills: false,
      positions: false,
    }
  }
 }

  componentDidMount() {
    const projectId: string = (new RegExp("id=([^&]+)")).exec(document.location.search)[1];
    ProjectAPIUtils.fetchProjectDetails(projectId, this.loadProjectDetails.bind(this));

  }

  loadProjectDetails(project) {
    this.setState({
      project: project,
    });
  }

  handleShowVolunteerModal(position: ?PositionInfo) {
    this.setState({
      showJoinModal: true,
      positionToJoin: position
    });
  }

  confirmJoinProject(confirmJoin: boolean) {
    if(confirmJoin) {
      window.location.reload(true);
    } else {
      this.setState({showJoinModal: false});
    }
  }

  changeHighlighted(tab) {
   let tabs = {
      details: false,
      skills: false,
      positions: false,
    }

    tabs[tab] = true;
    this.setState({tabs});
  }

  render(): $React$Node {
    return this.state.project ? this._renderDetails() : <div>Loading...</div>
  }

  _renderDetails(): React$Node {
    const project = this.state.project;
    // console.log(project);
    return (
      <div className='AboutProjects-root'>
        <Grid container className='AboutProjects-container' spacing={8}>

          <Grid item xs={3}>
            <Paper className='AboutProjects-paper' elevation={1}>

              <Grid className='AboutProjects-iconContainer'>
                <img className='AboutProjects-icon'src={project && project.project_thumbnail && project.project_thumbnail.publicUrl} />
              </Grid>

              <Divider />

              <Grid className='AboutProjects-details'>
                <ProjectDetails projectLocation={project && project.project_location}
                projectUrl={project && project.project_url}
                projectStage={project && project.project_stage && project.project_stage[0].display_name}
                dateModified={project && project.project_date_modified}/>
              </Grid>


              <Divider />

              <Grid className='AboutProjects-links'>
                <p>Links</p>
                {project && !_.isEmpty(project.project_links) && this._renderLinks()}
              </Grid>

              <Divider />

              <Grid className='AboutProjects-communities'>
                <p>Communities</p>
                <ul>
                  {
                    project &&
                    project.project_organization &&
                    project.project_organization.map((org, i) => {
                      return <li key={i}>{org.display_name}</li>
                    })
                  }
                </ul>
              </Grid>

              <Divider />

              <Grid className='AboutProjects-team'>
                <p>Team</p>
                  {
                    project && !_.isEmpty(project.project_owners)
                    ? <ProjectOwnersSection
                      owners={project.project_owners}
                      />
                    : null
                  }

                  {
                  project && !_.isEmpty(project.project_volunteers)
                    ? <VolunteerSection
                        volunteers={project.project_volunteers}
                        isProjectAdmin={CurrentUser.userID() === project.project_creator}
                        isProjectCoOwner={CurrentUser.isCoOwner(project)}
                        projectId={project.project_id}
                      />
                    : null
                  }
              </Grid>

            </Paper>
          </Grid>

          <Grid item xs={9}>
            <Paper className='AboutProjects-paper' elevation={1}>
              <Grid className='AboutProjects-intro' container direction='row' alignItems='flex-start' justify='center'>
                  <Grid className='AboutProjects-description' item xs={9}>
                    <h3>{project && project.project_name}</h3>
                    <p className='AboutProjects-description-issue'>{project && project.project_issue_area && project.project_issue_area.map(issue => issue.display_name).join(',')}</p>
                    <p>{project && project.project_short_description}</p>
                  </Grid>

                  <Grid className='AboutProjects-owner' item xs={3}>
                    <ContactProjectButton project={project}/>
                   {/* { CurrentUser.isLoggedIn() && !CurrentUser.isEmailVerified() && <VerifyEmailBlurb/> } */}
                  </Grid>
              <div className="AboutProjects_tabs">
                <a  onClick={() => this.changeHighlighted('details')} className={this.state.tabs.details ? 'AboutProjects_aHighlighted' : 'none'}href="#project-details">Details</a>
                <a onClick={() => this.changeHighlighted('skills')} className={this.state.tabs.skills ? 'AboutProjects_aHighlighted' : 'none'} href="#skills-needed">Skills Needed</a>
                <a  onClick={() => this.changeHighlighted('positions')} className={this.state.tabs.positions ? 'AboutProjects_aHighlighted' : 'none'} href="#AboutProjects-positions-available">Positions</a>
              </div>

              </Grid>
              <Divider />

              <Grid className='AboutProjects-description-details'>
                <div id='project-details'>{project.project_description}</div>
              <Grid className='AboutProjects-skills-container' container direction='row'>
                <div className='AboutProjects-skills'>
                  <p id='skills-needed' className='AboutProjects-skills-title'>Skills Needed</p>
                  {project && project.project_positions && project.project_positions.map(position => <p>{position.roleTag.tag_name.split('-').map(word => word[0].toUpperCase() + word.slice(1)).join(' ')}</p>)}
                </div>
                <div className='AboutProjects-technologies'>
                  <p className='AboutProjects-tech-title'>Technologies Used</p>
                  {project && project.project_technologies && project.project_technologies.map(tech => <p>{tech.display_name}</p>)}
                </div>
                <Grid item xs={6}></Grid>
                </Grid>
              </Grid>
              <Divider/>
              <Grid id='AboutProjects-positions-available' container>
              {project && !_.isEmpty(project.project_positions) && this._renderPositions()}

              </Grid>
            </Paper>
          </Grid>

        </Grid>
      </div>
    )
  }

  _renderLinks(): ?Array<React$Node> {
    const project = this.state.project;
    return project && project.project_links && project.project_links.map((link, i) =>
      <div key={i}>
        <a href={link.linkUrl} target="_blank" rel="noopener noreferrer">{this._legibleName(link.linkName)}</a>
      </div>
    );
  }

    _legibleName(input) {
    //replaces specific linkNames for readability
    return LinkNames[input] || input;
  }

  _renderPositions(): ?Array<React$Node> {
    const project: ProjectDetailsAPIData = this.state.project;
    const canApply: boolean = CurrentUser.canVolunteerForProject(project);
    return project && project.project_positions && _.chain(project.project_positions).sortBy(['roleTag.subcategory', 'roleTag.display_name']).value()
      .map((position, i) => {
        return <AboutPositionEntry
          key={i}
          position={position}
          onClickApply={canApply ? this.handleShowVolunteerModal.bind(this, position) : null}
        />;
      });
    }
}

export default AboutProjectController;
