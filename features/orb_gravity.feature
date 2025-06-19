Feature: Orb gravitational pull
  Scenario: Orbs curve toward nearby planets
    Given I open the game page
    When I click the start screen
    Then the game should appear after a short delay
    And I clear existing orbs
    And I spawn a planet offset by 140 0 from the ship
    And I spawn a stationary red orb offset by 270 0 from the ship
    And I record the orb position
    And I wait for 1000 ms
    Then the orb should have moved
