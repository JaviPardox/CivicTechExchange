// @flow

import React from 'react'
import {Container} from 'flux/utils';
import type {TagDefinition} from '../../utils/ProjectAPIUtils.js';
import ProjectAPIUtils from '../../utils/ProjectAPIUtils.js';
import SelectorCollapsible from "../selection/SelectorCollapsible.jsx";
import ProjectSearchStore from "../../stores/ProjectSearchStore.js";
import ProjectSearchDispatcher from "../../stores/ProjectSearchDispatcher.js";
import metrics from "../../utils/metrics";
import _ from 'lodash'

/**
 * @category: Tag category to pull from
 * @title: Title of the dropdown
 */
type Props = {|
  category: string,
  title: string
|};

type State = {|
  tags: ?$ReadOnlyArray<TagDefinition>,
  tagCounts: ?{ [key: string]: number },
  selectedTags: ?{ [key: string]: boolean },
  hasSubcategories: boolean
|};

/**
 * Dropdown selector for tags
 */
class TagSelectorCollapsible extends React.Component<Props, State> {
  constructor(props: Props): void {
    super(props);
    this.state = {tags: null};

    // TODO: Use Flux to get tags in a single request
    // passing true to fetchTagsByCategory asks backend to return num_times in API response
    ProjectAPIUtils.fetchTagsByCategory(this.props.category, true, tags => {
      this.setState({
        tags: tags,
        hasSubcategories: _.every(tags, tag => !_.isEmpty(tag.subcategory))
      });
    });
    this._displayTag = this._displayTag.bind(this);
    this._tagEnabled = this._tagEnabled.bind(this);
  }

  static getStores(): $ReadOnlyArray<FluxReduceStore> {
    return [ProjectSearchStore];
  }

  static calculateState(prevState: State): State {
    return {
      selectedTags:_.mapKeys(ProjectSearchStore.getTags().toArray(), (tag: TagDefinition) => tag.tag_name)
    };
  }


  selectTag(tags, opts): void {
    //opts is optional, if passed in expect opts to be an object formatted like { multiple: true, type: ACTION_TO_TAKE }
    var opts = opts || {}; //to avoid undefined error, create an empty object if opts isn't passed in. TODO: make this work with let instead of var
    if (opts.multiple && opts.type) {
      let tagnames = tags.map(function(t) {
          return t.tag_name
      });
      ProjectSearchDispatcher.dispatch({
        type: opts.type,
        tag: tagnames,
      });
      //TODO: Add metrics event for multiple tag filtering
    } else {
    var tagInState = _.has(this.state.selectedTags, tag.tag_name);
    //if tag is NOT currently in state, add it, otherwise remove
    if(!tagInState) {
      ProjectSearchDispatcher.dispatch({
        type: 'ADD_TAG',
        tag: tag.tag_name,
      });
      metrics.addTagFilterEvent(tag);
    } else {
      ProjectSearchDispatcher.dispatch({
        type: 'REMOVE_TAG',
        tag: tag,
      });
    }
    }
  }

  render(): React$Node {
    return (
      <div>
        { this.state.tags
          ? (
            <SelectorCollapsible
              title={this.props.title}
              options={this.state.tags}
              optionCategory={this.state.hasSubcategories && (tag => tag.subcategory)}
              optionDisplay={tag => this._displayTag(tag)}
              optionEnabled={tag => this._tagEnabled(tag)}
              onOptionSelect={this.selectTag.bind(this)}
            />
            )
          : null
        }
      </div>
    );
  }


  _tagEnabled(tag: TagDefinition): boolean {
    //return true if tag is in this.state.selectedTags, else implicitly false
    return _.has(this.state.selectedTags, tag.tag_name)
  }

  _displayTag(tag: TagDefinition): string {
    return tag.display_name;
  }
}

export default Container.create(TagSelectorCollapsible);
