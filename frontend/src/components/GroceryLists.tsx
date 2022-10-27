import dateFormat from 'dateformat'
import { History } from 'history'
import update from 'immutability-helper'
import * as React from 'react'
import {
  Button,
  Checkbox,
  Divider,
  Grid,
  Header,
  Icon,
  Input,
  Image,
  Loader
} from 'semantic-ui-react'

import { createGroceryList, deleteGroceryList, getGroceryLists, patchGroceryList } from '../api/GroceryLists-api'
import Auth from '../auth/Auth'
import { GroceryList } from '../types/GroceryList'

interface GroceryListsProps {
  auth: Auth
  history: History
}

interface GroceryListsState {
  GroceryLists: GroceryList[]
  newGroceryListName: string
  loadingGroceryLists: boolean
}

export class GroceryLists extends React.PureComponent<GroceryListsProps, GroceryListsState> {
  state: GroceryListsState = {
    GroceryLists: [],
    newGroceryListName: '',
    loadingGroceryLists: true
  }

  handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newGroceryListName: event.target.value })
  }

  onEditButtonClick = (GroceryListId: string) => {
    this.props.history.push(`/GroceryLists/${GroceryListId}/edit`)
  }

  onGroceryListCreate = async (event: React.ChangeEvent<HTMLButtonElement>) => {
    try {
      const dueDate = this.calculateDueDate()
      const newGroceryList = await createGroceryList(this.props.auth.getIdToken(), {
        name: this.state.newGroceryListName,
        dueDate
      })
      this.setState({
        GroceryLists: [...this.state.GroceryLists, newGroceryList],
        newGroceryListName: ''
      })
    } catch {
      alert('GroceryList creation failed')
    }
  }

  onGroceryListDelete = async (GroceryListId: string) => {
    try {
      await deleteGroceryList(this.props.auth.getIdToken(), GroceryListId)
      this.setState({
        GroceryLists: this.state.GroceryLists.filter(GroceryList => GroceryList.GroceryListId !== GroceryListId)
      })
    } catch {
      alert('GroceryList deletion failed')
    }
  }

  onGroceryListCheck = async (pos: number) => {
    try {
      const GroceryList = this.state.GroceryLists[pos]
      await patchGroceryList(this.props.auth.getIdToken(), GroceryList.GroceryListId, {
        name: GroceryList.name,
        dueDate: GroceryList.dueDate,
        done: !GroceryList.done
      })
      this.setState({
        GroceryLists: update(this.state.GroceryLists, {
          [pos]: { done: { $set: !GroceryList.done } }
        })
      })
    } catch {
      alert('GroceryList deletion failed')
    }
  }

  async componentDidMount() {
    try {
      const GroceryLists = await getGroceryLists(this.props.auth.getIdToken())
      this.setState({
        GroceryLists,
        loadingGroceryLists: false
      })
    } catch (e) {
      alert(`Failed to fetch GroceryLists: ${(e as Error).message}`)
    }
  }

  render() {
    return (
      <div>
        <Header as="h1">GroceryLists</Header>

        {this.renderCreateGroceryListInput()}

        {this.renderGroceryLists()}
      </div>
    )
  }

  renderCreateGroceryListInput() {
    return (
      <Grid.Row>
        <Grid.Column width={16}>
          <Input
            action={{
              color: 'teal',
              labelPosition: 'left',
              icon: 'add',
              content: 'New task',
              onClick: this.onGroceryListCreate
            }}
            fluid
            actionPosition="left"
            placeholder="To change the world..."
            onChange={this.handleNameChange}
          />
        </Grid.Column>
        <Grid.Column width={16}>
          <Divider />
        </Grid.Column>
      </Grid.Row>
    )
  }

  renderGroceryLists() {
    if (this.state.loadingGroceryLists) {
      return this.renderLoading()
    }

    return this.renderGroceryListsList()
  }

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading GroceryLists
        </Loader>
      </Grid.Row>
    )
  }

  renderGroceryListsList() {
    return (
      <Grid padded>
        {this.state.GroceryLists.map((GroceryList, pos) => {
          return (
            <Grid.Row key={GroceryList.GroceryListId}>
              <Grid.Column width={1} verticalAlign="middle">
                <Checkbox
                  onChange={() => this.onGroceryListCheck(pos)}
                  checked={GroceryList.done}
                />
              </Grid.Column>
              <Grid.Column width={10} verticalAlign="middle">
                {GroceryList.name}
              </Grid.Column>
              <Grid.Column width={3} floated="right">
                {GroceryList.dueDate}
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="blue"
                  onClick={() => this.onEditButtonClick(GroceryList.GroceryListId)}
                >
                  <Icon name="pencil" />
                </Button>
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="red"
                  onClick={() => this.onGroceryListDelete(GroceryList.GroceryListId)}
                >
                  <Icon name="delete" />
                </Button>
              </Grid.Column>
              {GroceryList.attachmentUrl && (
                <Image src={GroceryList.attachmentUrl} size="small" wrapped />
              )}
              <Grid.Column width={16}>
                <Divider />
              </Grid.Column>
            </Grid.Row>
          )
        })}
      </Grid>
    )
  }

  calculateDueDate(): string {
    const date = new Date()
    date.setDate(date.getDate() + 7)

    return dateFormat(date, 'yyyy-mm-dd') as string
  }
}
