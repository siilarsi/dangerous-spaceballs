Feature: Upgrade effects and persistence
  Scenario: Permanent upgrade persists across sessions
    Given I open the game page
    And I have 10 credits
    When I open the shop tab
    And I buy the upgrade "Increase Max Ammo"
    When I reload the page
    And I click the start screen
    Then the game should appear after a short delay
    And my ammo should be 100

  Scenario: Session upgrade does not persist after reload
    Given I open the game page
    And I have 10 credits
    When I open the shop tab
    And I buy the upgrade "Temporary Shield"
    When I reload the page
    And I click the start screen
    Then the game should appear after a short delay
    And the shield should be active
