Feature: Planet hazards
  Scenario: Ship crashes into a planet
    Given I open the game page
    When I click the start screen
    Then the game should appear after a short delay
    When I spawn a planet on the ship
    Then the game should be over

  Scenario: Orbs crash into planets with audio feedback
    Given I open the game page
    When I click the start screen
    Then the game should appear after a short delay
    And I monitor the bad hit sound
    And I clear existing orbs
    And I spawn a planet offset by 140 0 from the ship
    And I spawn a stationary red orb offset by 140 0 from the ship
    And I wait for 200 ms
    Then no orbs should be visible
    And the bad hit sound should play
